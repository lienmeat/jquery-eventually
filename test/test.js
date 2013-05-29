module("eventually");

test("Constructor", function() {
	var v1 = $(window).eventually();
	var v2 = $(window).eventually();
	equal( v1, v2, "Calling eventually() multiple times must return the same thing.");	
});

test("Basic on() and trigger() test", function() {
	var on = false;
	var before = false;
	var after = false;
	$(document).eventually('on', '1', {}, function(e){ on = true; });
	$(document).eventually('before', '1', {}, function(e){ before = true; });
	$(document).eventually('after', '1', {}, function(e){ after = true; });
	var res = $(document).eventually('trigger','1');
	equal(true, before, 'before() fires when eventually("trigger") is called');
	equal(true, on, 'on() fires when eventually("trigger") is called');
	equal(true, after, 'after() fires when eventually("trigger") is called');
	equal( true, res, 'Making sure before(), on(), after() and trigger() work correctly in most basic case');
});

test("Handlers fired when outside event triggered", function() {
	var on = false;
	var before = false;
	var after = false;
	$(document).eventually('on', 'click', {}, function(e){ on = true; });
	$(document).eventually('before', 'click', {}, function(e){ before = true; });
	$(document).eventually('after', 'click', {}, function(e){ after = true; });
	$(document).trigger('click');
	equal(true, before, 'before() fires when event is triggered outside of eventually');
	equal(true, on, 'on() fires when event is triggered outside of eventually');
	equal(true, after, 'after() fires when event is triggered outside of eventually');	
});

test("Event data gets passed to on, before, after handlers", function() {
	var on = false;
	var before = false;
	var after = false;
	$(document).eventually('on', 'click1', {}, function(e){ on = e.original_event; });
	$(document).eventually('before', 'click1', {}, function(e){ before = e.original_event; });
	$(document).eventually('after', 'click1', {}, function(e){ after = e.original_event; });
	$(document).eventually('trigger', 'click1');
	ok(on, 'Original event data exists');
	equal(before, on, 'Original event data of before and on is the same');
	equal(after, on, 'Original event data of on and after is the same');
});

test("Data set on listener gets passed to on, before, after handlers", function() {
	var on = false;
	var before = false;
	var after = false;
	var data = {'test': 'data'};
	$(document).eventually('on', 'click2', data, function(e){ on = e.data; });
	$(document).eventually('before', 'click2', data, function(e){ before = e.data; });
	$(document).eventually('after', 'click2', data, function(e){ after = e.data; });
	$(document).eventually('trigger', 'click2');
	equal(data, before, 'Data passed to before handler');
	equal(data, on, 'Data passed to on handler');
	equal(data, after, 'Data passed to after handler');
	
});

test("Returning false in before() prevents on(), after() from firing test", function() {
	var on = false;
	var before = false;
	var before2 = false;
	var after = false;
	$(document).eventually('before', '2', {}, function(e){ before = true; return false; });
	$(document).eventually('before', '2', {}, function(e){ before2 = true; });
	$(document).eventually('on', '2', {}, function(e){ on = true; });
	$(document).eventually('after', '2', {}, function(e){ after = true; });
	var res = $(document).eventually('trigger','2');
	equal(true, before, 'before() fires when eventually("trigger") is called');
	equal(true, before2, '2nd before() fires when eventually("trigger") is called and first before() returns false');
	equal(false, on, 'on() is prevented from firing if before handler returns false');
	equal(false, after, 'after() is prevented from firing if before handler returns false');
	equal(false, res, 'trigger() returns false when propagation is stopped using return false in before()');
});

test("Returning false in on() prevents after() from firing test", function() {
	var on = false;
	var on2 = false;
	var before = false;	
	var after = false;
	$(document).eventually('before', 'o2', {}, function(e){ before = true; });
	$(document).eventually('on', 'o2', {}, function(e){ on = true; return false; });
	$(document).eventually('on', 'o2', {}, function(e){ on2 = true; });
	$(document).eventually('after', 'o2', {}, function(e){ after = true; });
	var res = $(document).eventually('trigger','o2');
	equal(true, before, 'before() fires when eventually("trigger") is called');
	equal(true, on, 'on() fires when eventually("trigger") is called');
	equal(true, on2, '2nd on() fires even though 1st on returned false');
	equal(false, after, 'after() is prevented from firing if on() handler returns false');
	equal(false, res, 'trigger() returns false when propagation is stopped using return false in on()');
});

test("Returning false in after() prevents nothing test", function() {
	var on = false;
	var before = false;	
	var after = false;
	var after2 = false;
	$(document).eventually('before', 'o3', {}, function(e){ before = true; });
	$(document).eventually('on', 'o3', {}, function(e){ on = true; });
	$(document).eventually('after', 'o3', {}, function(e){ after = true; return false; });
	$(document).eventually('after', 'o3', {}, function(e){ after2 = true; });
	var res = $(document).eventually('trigger','o3');
	equal(true, before, 'before() fires when eventually("trigger") is called');
	equal(true, on, 'on() fires when eventually("trigger") is called');
	equal(true, after, 'after() fires when eventuall("trigger") is called');
	equal(true, after2, '2nd after() fires even though the first returns false');
	equal(true, res, 'trigger() returns true, even though after() returns false!');
});

test("Stoping propagation in before() using event.stopImmediatePropagation() test", function() {
	var one = false;
	var two = false;
	var three = false;
	var four = false;	
	$(document).eventually('before', '3', {}, function(e){ one = true; e.stopImmediatePropagation(); });
	$(document).eventually('before', '3', {}, function(e){ two = true; });
	$(document).eventually('on', '3', {}, function(e){ three = true; });
	$(document).eventually('after', '3', {}, function(e){ four = true; });
	var res = $(document).eventually('trigger', '3');
	equal(true, one, '1st before() handler fires');
	equal(false, two, '2nd before() handler is prevented from firing');
	equal(false, three, 'on() handler is prevented from firing');
	equal(false, four, 'after() handler is prevented from firing');
	equal(false, res, 'false returned by trigger');
});

test("Stoping propagation in on() using event.stopImmediatePropagation() test", function() {
	var one = false;
	var two = false;
	var three = false;
	var four = false;	
	$(document).eventually('before', '4', {}, function(e){ one = true; });
	$(document).eventually('on', '4', {}, function(e){ two = true; e.stopImmediatePropagation(); });
	$(document).eventually('on', '4', {}, function(e){ three = true; });
	$(document).eventually('after', '4', {}, function(e){ four = true; });
	var res = $(document).eventually('trigger', '4');
	equal(true, one, 'before() handler fires');
	equal(true, two, '1st on() handler fires');
	equal(false, three, '2nd on() handler is prevented from firing');
	equal(false, four, 'after() handler is prevented from firing');
	equal(false, res, 'false returned by trigger');
});

test("Stoping propagation in after() using event.stopImmediatePropagation() test", function() {
	var one = false;
	var two = false;
	var three = false;
	var four = false;	
	$(document).eventually('before', '5', {}, function(e){ one = true; });
	$(document).eventually('on', '5', {}, function(e){ two = true; });
	$(document).eventually('after', '5', {}, function(e){ three = true; e.stopImmediatePropagation(); });
	$(document).eventually('after', '5', {}, function(e){ four = true; });
	var res = $(document).eventually('trigger', '5');
	equal(true, one, 'before() handler fires');
	equal(true, two, 'on() handler fires');
	equal(true, three, '1st after() handler fires');
	equal(false, four, '2nd after() handler is prevented from firing');
	equal(true, res, 'true returned by trigger (after() cannot affect trigger return status!)');
});