steal('jquery', 'can/util/can.js', 'can/util/array/each.js', "can/util/inserted","can/util/event.js",function($, can) {
	// _jQuery node list._
	$.extend( can, $, {
		trigger: function( obj, event, args ) {
			if(obj.nodeName || obj === window) {
				$.event.trigger( event, args, obj, true );
			} else if ( obj.trigger ) {
				obj.trigger( event, args );
			} else {
				if(typeof event === 'string'){
					event = {type: event}
				}
				event.target = event.target || obj;
				can.dispatch.call(obj, event, args);
			}
		},
		addEvent: can.addEvent,
		removeEvent: can.removeEvent,
		// jquery caches fragments, we always needs a new one
		buildFragment : function(elems, context){
			var oldFragment = $.buildFragment,
				ret;

			elems = [elems];
			// Set context per 1.8 logic
			context = context || document;
			context = !context.nodeType && context[0] || context;
			context = context.ownerDocument || context;

			ret = oldFragment.call( jQuery, elems, context);

			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment || ret;
		},
		$: $,
		each: can.each,
		bind: function( ev, cb){
			// If we can bind to it...
			if(this.bind && this.bind !== can.bind){
				this.bind(ev, cb)
			} else if(this.nodeName && this.nodeType == 1 || this === window) {
				$.event.add(this, ev, cb);
			} else {
				// Make it bind-able...
				can.addEvent.call(this, ev, cb)
			}
			return this;
		},
		unbind: function(ev, cb){
			// If we can bind to it...
			if(this.unbind && this.unbind !== can.unbind){
				this.unbind(ev, cb)
			} else if(this.nodeName && this.nodeType == 1 || this === window) {
				$.event.remove(this, ev, cb);
			} else {
				// Make it bind-able...
				can.removeEvent.call(this, ev, cb)
			}
			return this;
		},
		delegate: function(selector, ev , cb){
			if(this.delegate) {
				this.delegate(selector, ev , cb)
			}
			 else if(this.nodeName && this.nodeType == 1 || this === window) {
				$(this).delegate(selector, ev, cb)
			} else {
				// make it bind-able ...
			}
			return this;
		},
		undelegate: function(selector, ev , cb){
			if(this.undelegate) {
				this.undelegate(selector, ev , cb)
			}
			 else if(this.nodeName && this.nodeType == 1 || this === window) {
				$(this).undelegate(selector, ev, cb)
			} else {
				// make it bind-able ...
	
			}
			return this;
		}
	});

	// Wrap binding functions.
	/*$.each(['bind','unbind','undelegate','delegate'],function(i,func){
		can[func] = function(){
			var t = this[func] ? this : $([this]);
			t[func].apply(t, arguments);
			return this;
		};
	});*/

	// Aliases
	can.on = can.bind;
	can.off = can.unbind;

	// Wrap modifier functions.
	$.each(["append","filter","addClass","remove","data","get","has"], function(i,name){
		can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1));
		};
	});

	// Memory safe destruction.
	var oldClean = $.cleanData;

	$.cleanData = function( elems ) {
		$.each( elems, function( i, elem ) {
			if ( elem ) {
				can.trigger(elem,"removed",[],false);
			}
		});
		oldClean(elems);
	};
	
	var oldDomManip = $.fn.domManip;
	
	$.fn.domManip = function(args, table, callback){
		return oldDomManip.call(this,args,table, function(elem){
			if(elem.nodeType === 11){
				var elems = can.makeArray(elem.childNodes);
			}
			var ret = callback.apply(this, arguments);
			can.inserted(elems? elems : [elem])
			return ret
		})
	}
	$.event.special.inserted = {};
	$.event.special.removed = {};

	return can;
});
