(function($) {
	
	function Eventually(jquery, config){
		//version information
		this.version = "1.0.6";
		//name of $.fn.<plugin_name> (for own use, and also for $.fn.<plugin_name>)
		this.plugin_name = "eventually";
		//instance of jquery passed to $.fn.<plugin_name>
		this.jquery = jquery;
		//config passed to $.fn.<plugin_name>
		this.config = config;

		//register/alias methods $.fn.<plugin_name> is allowed to access (init is a given!)
		this.public_methods = {
			'on': this.on,
			'before': this.before,
			'after': this.after,
			'trigger': this.trigger,
		};		
	}

	Eventually.prototype.init = function(){ return this.jquery; }	

	/**
	* Private function which actually registers events and a callback to eventually
	* @param object jqselections jQuery object
	* @param string orig_event Original event name (click, blur, submit, <customname>)
	* @param string event Event to create (before_<orig_event>, on_<orig_event>, after_<orig_event>)
	* @param object data Data to bind pass to event
	* @param function handler Function to handle the event
	*/
	Eventually.prototype.registerEvent = function(orig_event, event, data, handler){
		var data = data || {};
		var handler = handler || function(data){ return; };
		//loop over selections, binding handler to event
		this.jquery.each(
			function(){
				//NOTE!: 'this' refers to a particular dom element in this scope!

				//bind handler on our event
				$(this).on(event, data, handler);

				//see if eventually is listening for this orig_event
				//on this dom element
				if(!this.eventually_listeners){
					this.eventually_listeners = {};
				}if(!this.eventually_listeners[orig_event]){
					//no eventually listener for this event and element yet,
					this.eventually_listeners[orig_event] = true;
					//create one
					$(this).on(orig_event, function(e){						
						$(this).eventually('trigger', orig_event, e);
					});
				}
			}
		);
	}

	/**
	* Creates and runs jQuery events on selections
	*/
	Eventually.prototype.triggerEvent = function(eventname, eventObj){
		var e = jQuery.Event(eventname);
		e.original_event = eventObj;
		//running jquerys trigger method on selections!
		this.jquery.trigger(e);
		return e;
	}

	/**
	* run an event listener before on handlers for event are triggered
	* @param string event Name of event to listen for		
	* @param object data Data that will be available under event.data property in listener.
	* @param function handler Function to call when event is triggered that will handle the event
	*/
	Eventually.prototype.before = function(event, data, handler) {			
		this.registerEvent(event, 'before_'+event, data, handler);
		return this.jquery;
	}

	/**
	* run an event listener when event is triggered (after before handlers)
	* @param string event Name of event to listen for
	* @param object data Data that will be available under event.data property in listener.
	* @param function handler Function to call when event is triggered that will handle the event
	*/
	Eventually.prototype.on = function(event, data, handler) {		
		this.registerEvent(event, 'on_'+event, data, handler);
		return this.jquery;		
	}

	/**
	* run an event listener after event is triggered
	* @param string event Name of event to listen for		
	* @param object data Data that will be available under event.data property in listener.
	* @param function handler Function to call when event is triggered that will handle the event
	*/	
	Eventually.prototype.after = function(event, data, handler) {
		this.registerEvent(event, 'after_'+event, data, handler);
		return this.jquery;
	}

	/**
	* Trigger an event (and it's before/after events as well)
	* @param string event Name of event to trigger
	* @param object eventObj Event data object that will be available to all before,
	* on, and after listeners under event.original_event property in listener.
	* @return bool True if all before and on listeners fired and didn't stop propagation, false otherwise.
	* This will cause events to stop propagating on actual dom events!
	*/
	Eventually.prototype.trigger = function(event, eventObj){
		var eventObj = eventObj || {};
		//create befor<event> and run it
		var bevent = this.triggerEvent('before_'+event, eventObj);
		//if before_<event> was not killed, create and run the on_<event>
		if(!bevent.isDefaultPrevented() && !bevent.isPropagationStopped() && !bevent.isImmediatePropagationStopped()){				
			var oevent = this.triggerEvent('on_'+event, eventObj);
			//if on_<event> was not killed, create and run the after_<event>	
			if(!oevent.isDefaultPrevented() && !oevent.isPropagationStopped() && !oevent.isImmediatePropagationStopped()){			
				var aevent = this.triggerEvent('after_'+event, eventObj);
				return true;
			}
		}
		//if we got here, propagation was stopped somewhere in befor<event> or on_<event>
		//prevent ACTUAL event from propagating further, if possible
		if(eventObj.stopPropagation){
			eventObj.stopPropagation();
			eventObj.stopImmediatePropagation();
			eventObj.preventDefault();
		}
		//return false.  This trigger did not complete cleanly.
		return false;
	}

	$.fn.eventually = function(methodOrOptions){		
		//Instantiate plugin object with instance of jquery as argument, so it has it, and any config options it might need
		var obj = new Eventually(this, methodOrOptions);

		//run public methods or init, or report error (Please never touch any of this!  It shouldn't need to change!)
		if( obj.public_methods[ methodOrOptions ] ){
			return obj.public_methods[ methodOrOptions ].apply( obj, Array.prototype.slice.call( arguments, 1 ));
		}else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ){
			// Default to "init"
			return obj.init.apply( obj, arguments );
		}else{
			$.error( 'Method ' +  methodOrOptions + ' does not exist on '+obj.plugin_name );
		}
	}			
}(jQuery));