(function($) {
	
	var methods = {
		init : function(){
			void(0);
		},

		/**
		* run an event listener before on handlers for event are triggered
		* @param string event Name of event to listen for		
		* @param object data Data that will be available under event.data property in listener.
		* @param function handler Function to call when event is triggered that will handle the event
		*/
		before : function(event, data, handler) {
			var data = data || {};			
			var handler = handler || function(data){ return; };
			this.each(function(){
					$(this).on('before_'+event, data, handler);
					if(!this.eventually_listeners){
						this.eventually_listeners = {};
					}if(!this.eventually_listeners[event]){
						this.eventually_listeners[event] = true;
						$(this).on(event, function(e){
							$(this).eventually('trigger', event, e);
						});
					}
				}
			);			
		},

		/**
		* run an event listener when event is triggered (after before handlers)
		* @param string event Name of event to listen for
		* @param object data Data that will be available under event.data property in listener.
		* @param function handler Function to call when event is triggered that will handle the event
		*/
		on : function(event, data, handler) {
			var data = data || {};			
			var handler = handler || function(data){ return; };
			this.each(function(){
					$(this).on('on_'+event, data, handler);
					if(!this.eventually_listeners){
						this.eventually_listeners = {};
					}if(!this.eventually_listeners[event]){
						this.eventually_listeners[event] = true;
						$(this).on(event, function(e){
							$(this).eventually('trigger', event, e);
						});
					}
				}
			);			
		},

		/**
		* run an event listener after event is triggered
		* @param string event Name of event to listen for		
		* @param object data Data that will be available under event.data property in listener.
		* @param function handler Function to call when event is triggered that will handle the event
		*/
		after : function(event, data, handler) {
			var data = data || {};			
			var handler = handler || function(data){ return; };
			this.each(function(){
					$(this).on('after_'+event, data, handler);
					if(!this.eventually_listeners){
						this.eventually_listeners = {};
					}if(!this.eventually_listeners[event]){
						this.eventually_listeners[event] = true;
						$(this).on(event, function(e){
							$(this).eventually('trigger', event, e);
						});
					}
				}
			);			
		},

		/**
		* Trigger an event (and it's before/after events as well)
		* @param string event Name of event to trigger
		* @param object eventObj Event data object that will be available to all before,
		* on, and after listeners under event.original_event property in listener.
		* @return bool True if all before and on listeners fired and didn't stop propagation, false otherwise.
		* This will cause events to stop propagating on actual dom events!
		*/
		trigger : function(event, eventObj){
			var eventObj = eventObj || {};
			var bevent = jQuery.Event('before_'+event);
			bevent.original_event = eventObj;
			$(this).trigger(bevent);
			if(!bevent.isDefaultPrevented() && !bevent.isPropagationStopped() && !bevent.isImmediatePropagationStopped()){				
				var oevent = jQuery.Event('on_'+event);
				oevent.original_event = eventObj;
				$(this).trigger(oevent);
				if(!oevent.isDefaultPrevented() && !oevent.isPropagationStopped() && !oevent.isImmediatePropagationStopped()){			
					var aevent = jQuery.Event('after_'+event);
					aevent.original_event = eventObj;		
					$(this).trigger(aevent);
					return true;
				}
			}
			if(eventObj.stopPropagation){
				eventObj.stopPropagation();
				eventObj.stopImmediatePropagation();
				eventObj.preventDefault();
			}
			return false;	
		}
	};

	$.fn.eventually = function(methodOrOptions) {
		this.version = '1.0';

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