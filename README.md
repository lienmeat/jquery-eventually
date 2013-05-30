jQuery.eventually
=================

Eventually is a powerful, easy to use event system utilizing jquery's events as its base.  Triggering an event using eventually automatically gives you before, on, and after events to listen for and handle, that obey logical event propogation rules.


How to use
----------

Here is example that shows some of its power:

  
    $(document).ready(function(e){
        $('#testbutton').eventually('before', 'click', {}, function(e){ alert('This fired first!'); });
        $('#testbutton').eventually('before', 'click', {}, function(e){ alert('This fired before doFunStuff() was called too!'); });
        $('#testbutton').eventually('on', 'click', {}, doFunStuff);
        $('#testbutton').eventually('after', 'click', {}, function(e){ alert('This fired after the doFunStuff() was called!'); });
    });
    
    function doFunStuff(event){
      alert('This fired after both "before" listeners ran!');
      $(window).eventually('after', 'customevent', {'something': 'interesting'}, function(e){ alert('customevent is done!'); });
      
      var eventdata = {
        "just": "a",
        "bit": "of",
        "application": "data"
      };
      $(window).eventually('trigger', 'customevent', eventdata);
    }  
  
    <button id="testbutton"></button>
    
Features/Notes
--------------
* `automatic event before and after states` - Any time you trigger, or listen for an event using eventually, you will automatically be able also listen/handle "before", "on", and "after" states! It's all free! (ex: running $("#buttonid").eventually("after", "click", {}, handlerFN); would AUTOMATICALLY allow you to also listen/handle "on" and "before" states with eventually if a click is ever triggered on that button, EVEN IF YOU DON'T USE EVENTUALLY TO ACTUALLY TRIGGER THE EVENT!  Yes, it is magic.)
* `custom events` - You can trigger custom events, with custom event data too, and they work very similarly to regular DOM events.
* `data exchange` - You can easily pass data along to the event from the listener definition.  It is then available under event.data (assuming the event is passed into the handler function as event).
* `control over propagation` - returning false from an event handler will prevent the propagation to continue to the next group of handlers.  So if something listening on "before" returns false, or calls event.stopPropagation();, the listeners for "on" and "after" will never be called, and false will be returned by the "trigger" method.  "After" listeners CANNOT affect the return status of the trigger, however!
* `original event is preserved` - Because we have to fire new, custom events to get these features, the original event data that caused the current "before", "on", "after" handler to run is always available in event.original_event.
* `pub/sub` - Given the above features, it's quite easy to make a pub/sub message system easily with very little programming.
