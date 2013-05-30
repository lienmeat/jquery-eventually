(function($) {
	
	var methods = {
		init : function(){
			return;
		},
		before : before,
		on : on,
		after : after,
		trigger : trigger,
	};

	/**
	* Private function which actually registers events and a callback to eventually
	* @param object jqselections jQuery object
	* @param string orig_event Original event name (click, blur, submit, <customname>)
	* @param string event Event to create (before_<orig_event>, on_<orig_event>, after_<orig_event>)
	* @param object data Data to bind pass to event
	* @param function handler Function to handle the event
	*/
	function registerEvent(jqselections, orig_event, event, data, handler){		
		var data = data || {};		
		var handler = handler || function(data){ return; };
		//loop over selections, binding handler to event
		jqselections.each(
			function(){
				//bind handler on our event
				$(this).on(event, data, handler);

				//see if eventually is listening for this orig_event
				//on this dom element
				if(!this.eventually_listeners){
					this.eventually_listeners = {};
				}if(!this.eventually_listeners[event]){
					//no eventually listener for this event and element yet,
					this.eventually_listeners[event] = true;
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
	function triggerEvent(jqselections, eventname, eventObj){
		var e = jQuery.Event(eventname);
		e.original_event = eventObj;
		jqselections.trigger(e);
		return e;
	}

	/**
	* run an event listener before on handlers for event are triggered
	* @param string event Name of event to listen for		
	* @param object data Data that will be available under event.data property in listener.
	* @param function handler Function to call when event is triggered that will handle the event
	*/
	function before(event, data, handler) {			
		registerEvent(this, event, 'befor'+event, data, handler);
	}

	/**
	* run an event listener when event is triggered (after before handlers)
	* @param string event Name of event to listen for
	* @param object data Data that will be available under event.data property in listener.
	* @param function handler Function to call when event is triggered that will handle the event
	*/
	function on(event, data, handler) {		
		registerEvent(this, event, 'on_'+event, data, handler);			
	}

	/**
	* run an event listener after event is triggered
	* @param string event Name of event to listen for		
	* @param object data Data that will be available under event.data property in listener.
	* @param function handler Function to call when event is triggered that will handle the event
	*/	
	function after(event, data, handler) {
		registerEvent(this, event, 'after_'+event, data, handler);			
	}

	/**
	* Trigger an event (and it's before/after events as well)
	* @param string event Name of event to trigger
	* @param object eventObj Event data object that will be available to all before,
	* on, and after listeners under event.original_event property in listener.
	* @return bool True if all before and on listeners fired and didn't stop propagation, false otherwise.
	* This will cause events to stop propagating on actual dom events!
	*/
	function trigger(event, eventObj){
		var eventObj = eventObj || {};
		//create befor<event> and run it
		var bevent = triggerEvent(this, 'befor'+event, eventObj);
		//if befor<event> was not killed, create and run the on_<event>
		if(!bevent.isDefaultPrevented() && !bevent.isPropagationStopped() && !bevent.isImmediatePropagationStopped()){				
			var oevent = triggerEvent(this, 'on_'+event, eventObj);
			//if on_<event> was not killed, create and run the after_<event>	
			if(!oevent.isDefaultPrevented() && !oevent.isPropagationStopped() && !oevent.isImmediatePropagationStopped()){			
				var aevent = triggerEvent(this, 'after_'+event, eventObj);
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

	$.fn.eventually = function(methodOrOptions) {
		this.version = '1.0.2';

		if ( methods[methodOrOptions] ) {
			return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ){
			// Default to "init"
			return methods.init.apply( this, arguments );
		}else{
			$.error( 'Method ' +  method + ' does not exist on jQuery.eventually' );
		}
	}		
}(jQuery));