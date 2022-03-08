
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1, Object: Object_1, console: console_1$1 } = globals;

    // (251:0) {:else}
    function create_else_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function toVal(mix) {
    	var k, y, str='';

    	if (typeof mix === 'string' || typeof mix === 'number') {
    		str += mix;
    	} else if (typeof mix === 'object') {
    		if (Array.isArray(mix)) {
    			for (k=0; k < mix.length; k++) {
    				if (mix[k]) {
    					if (y = toVal(mix[k])) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			}
    		} else {
    			for (k in mix) {
    				if (mix[k]) {
    					str && (str += ' ');
    					str += k;
    				}
    			}
    		}
    	}

    	return str;
    }

    function clsx () {
    	var i=0, tmp, x, str='';
    	while (i < arguments.length) {
    		if (tmp = arguments[i++]) {
    			if (x = toVal(tmp)) {
    				str && (str += ' ');
    				str += x;
    			}
    		}
    	}
    	return str;
    }

    /* src\components\Button.svelte generated by Svelte v3.46.4 */
    const file$k = "src\\components\\Button.svelte";

    // (38:31) 
    function create_if_block_3(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", /*_icon*/ ctx[6]);
    			add_location(i, file$k, 38, 8, 1257);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_icon*/ 64) {
    				attr_dev(i, "class", /*_icon*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(38:31) ",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#if loading}
    function create_if_block_2(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "el-icon-loading");
    			add_location(i, file$k, 36, 8, 1185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(36:4) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (43:32) 
    function create_if_block_1$3(ctx) {
    	let span;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			add_location(span, file$k, 43, 8, 1389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*text*/ 1)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(43:32) ",
    		ctx
    	});

    	return block;
    }

    // (41:4) {#if $$slots.default}
    function create_if_block$5(ctx) {
    	let span;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			add_location(span, file$k, 41, 8, 1324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(41:4) {#if $$slots.default}",
    		ctx
    	});

    	return block;
    }

    // (44:20) {text}
    function fallback_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*text*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(44:20) {text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let button;
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let button_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[1]) return create_if_block_2;
    		if (/*icon*/ ctx[3] && !/*loading*/ ctx[1]) return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	const if_block_creators = [create_if_block$5, create_if_block_1$3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$$slots*/ ctx[9].default) return 0;
    		if (/*text*/ ctx[0] != undefined) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(button, "class", /*classList*/ ctx[7]);
    			attr_dev(button, "style", button_style_value = /*$$props*/ ctx[8]["style"]);
    			button.disabled = /*disabled*/ ctx[2];
    			button.autofocus = /*autofocus*/ ctx[4];
    			attr_dev(button, "type", /*nativeType*/ ctx[5]);
    			add_location(button, file$k, 34, 0, 1055);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(button, null);
    			}

    			current = true;
    			if (/*autofocus*/ ctx[4]) button.focus();

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(button, t);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(button, null);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (!current || dirty & /*classList*/ 128) {
    				attr_dev(button, "class", /*classList*/ ctx[7]);
    			}

    			if (!current || dirty & /*$$props*/ 256 && button_style_value !== (button_style_value = /*$$props*/ ctx[8]["style"])) {
    				attr_dev(button, "style", button_style_value);
    			}

    			if (!current || dirty & /*disabled*/ 4) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (!current || dirty & /*autofocus*/ 16) {
    				prop_dev(button, "autofocus", /*autofocus*/ ctx[4]);
    			}

    			if (!current || dirty & /*nativeType*/ 32) {
    				attr_dev(button, "type", /*nativeType*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { text = undefined } = $$props;
    	let { size = "" } = $$props;
    	let { type = "default" } = $$props;
    	let { plain = false } = $$props;
    	let { round = false } = $$props;
    	let { circle = false } = $$props;
    	let { loading = false } = $$props;
    	let { disabled = false } = $$props;
    	let { icon = "" } = $$props;
    	let { autofocus = false } = $$props;
    	let { nativeType = "button" } = $$props;
    	let _icon;
    	let classList;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('text' in $$new_props) $$invalidate(0, text = $$new_props.text);
    		if ('size' in $$new_props) $$invalidate(10, size = $$new_props.size);
    		if ('type' in $$new_props) $$invalidate(11, type = $$new_props.type);
    		if ('plain' in $$new_props) $$invalidate(12, plain = $$new_props.plain);
    		if ('round' in $$new_props) $$invalidate(13, round = $$new_props.round);
    		if ('circle' in $$new_props) $$invalidate(14, circle = $$new_props.circle);
    		if ('loading' in $$new_props) $$invalidate(1, loading = $$new_props.loading);
    		if ('disabled' in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('icon' in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ('autofocus' in $$new_props) $$invalidate(4, autofocus = $$new_props.autofocus);
    		if ('nativeType' in $$new_props) $$invalidate(5, nativeType = $$new_props.nativeType);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		text,
    		size,
    		type,
    		plain,
    		round,
    		circle,
    		loading,
    		disabled,
    		icon,
    		autofocus,
    		nativeType,
    		_icon,
    		classList
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ('text' in $$props) $$invalidate(0, text = $$new_props.text);
    		if ('size' in $$props) $$invalidate(10, size = $$new_props.size);
    		if ('type' in $$props) $$invalidate(11, type = $$new_props.type);
    		if ('plain' in $$props) $$invalidate(12, plain = $$new_props.plain);
    		if ('round' in $$props) $$invalidate(13, round = $$new_props.round);
    		if ('circle' in $$props) $$invalidate(14, circle = $$new_props.circle);
    		if ('loading' in $$props) $$invalidate(1, loading = $$new_props.loading);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('icon' in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ('autofocus' in $$props) $$invalidate(4, autofocus = $$new_props.autofocus);
    		if ('nativeType' in $$props) $$invalidate(5, nativeType = $$new_props.nativeType);
    		if ('_icon' in $$props) $$invalidate(6, _icon = $$new_props._icon);
    		if ('classList' in $$props) $$invalidate(7, classList = $$new_props.classList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		{
    			$$invalidate(6, _icon = icon.substr(0, 8) == "el-icon-"
    			? icon
    			: `el-icon-${icon}`);

    			$$invalidate(7, classList = clsx(
    				"el-button",
    				`el-button--${type}`,
    				{
    					"is-disabled": loading == true
    					? false
    					: disabled == true ? true : false,
    					"is-loading": loading,
    					"is-plain": plain,
    					"is-round": round,
    					"is-circle": circle,
    					[`el-button--${size}`]: Boolean(size)
    				},
    				$$props["class"]
    			));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		text,
    		loading,
    		disabled,
    		icon,
    		autofocus,
    		nativeType,
    		_icon,
    		classList,
    		$$props,
    		$$slots,
    		size,
    		type,
    		plain,
    		round,
    		circle,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			text: 0,
    			size: 10,
    			type: 11,
    			plain: 12,
    			round: 13,
    			circle: 14,
    			loading: 1,
    			disabled: 2,
    			icon: 3,
    			autofocus: 4,
    			nativeType: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get plain() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plain(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get round() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set round(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get circle() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set circle(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autofocus() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autofocus(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nativeType() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nativeType(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ButtonGroup.svelte generated by Svelte v3.46.4 */
    const file$j = "src\\components\\ButtonGroup.svelte";

    function create_fragment$l(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = clsx('el-button-group', /*$$props*/ ctx[0]['class']));
    			attr_dev(div, "style", div_style_value = /*$$props*/ ctx[0]['style']);
    			add_location(div, file$j, 4, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 1 && div_class_value !== (div_class_value = clsx('el-button-group', /*$$props*/ ctx[0]['class']))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 1 && div_style_value !== (div_style_value = /*$$props*/ ctx[0]['style'])) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonGroup', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clsx });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, $$scope, slots];
    }

    class ButtonGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonGroup",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\components\Row.svelte generated by Svelte v3.46.4 */
    const file$i = "src\\components\\Row.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", /*classList*/ ctx[1]);
    			attr_dev(div, "style", /*style*/ ctx[0]);
    			add_location(div, file$i, 22, 0, 885);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*classList*/ 2) {
    				attr_dev(div, "class", /*classList*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 1) {
    				attr_dev(div, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $gutterStore;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, ['default']);
    	let { gutter = 0 } = $$props;
    	let { justify = "start" } = $$props;
    	let { type = undefined } = $$props;
    	let { align = undefined } = $$props;
    	let classList = undefined;
    	let style = undefined;
    	const gutterStore = writable(gutter);
    	validate_store(gutterStore, 'gutterStore');
    	component_subscribe($$self, gutterStore, value => $$invalidate(7, $gutterStore = value));
    	setContext("gutter", gutterStore);

    	$$self.$$set = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('gutter' in $$new_props) $$invalidate(3, gutter = $$new_props.gutter);
    		if ('justify' in $$new_props) $$invalidate(4, justify = $$new_props.justify);
    		if ('type' in $$new_props) $$invalidate(5, type = $$new_props.type);
    		if ('align' in $$new_props) $$invalidate(6, align = $$new_props.align);
    		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		setContext,
    		writable,
    		gutter,
    		justify,
    		type,
    		align,
    		classList,
    		style,
    		gutterStore,
    		$gutterStore
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), $$new_props));
    		if ('gutter' in $$props) $$invalidate(3, gutter = $$new_props.gutter);
    		if ('justify' in $$props) $$invalidate(4, justify = $$new_props.justify);
    		if ('type' in $$props) $$invalidate(5, type = $$new_props.type);
    		if ('align' in $$props) $$invalidate(6, align = $$new_props.align);
    		if ('classList' in $$props) $$invalidate(1, classList = $$new_props.classList);
    		if ('style' in $$props) $$invalidate(0, style = $$new_props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		{
    			$$invalidate(1, classList = clsx(
    				[
    					"el-row",
    					justify !== "start" ? `is-justify-${justify}` : "",
    					align ? `is-align-${align}` : "",
    					{ "el-row--flex": type === "flex" }
    				],
    				$$props["class"]
    			));

    			set_store_value(gutterStore, $gutterStore = gutter, $gutterStore);

    			$$invalidate(0, style = Boolean($gutterStore)
    			? `margin-left: -${$gutterStore / 2}px; margin-right: -${$gutterStore / 2}px;`
    			: undefined);

    			$$invalidate(0, style = clsx({ [`${style}`]: style != undefined }, $$props["style"]));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		style,
    		classList,
    		gutterStore,
    		gutter,
    		justify,
    		type,
    		align,
    		$gutterStore,
    		$$scope,
    		slots
    	];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { gutter: 3, justify: 4, type: 5, align: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get gutter() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gutter(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get justify() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set justify(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Col.svelte generated by Svelte v3.46.4 */
    const file$h = "src\\components\\Col.svelte";

    // (39:4) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(39:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#if $$props.text != undefined}
    function create_if_block$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*$$props*/ 8)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(37:4) {#if $$props.text != undefined}",
    		ctx
    	});

    	return block;
    }

    // (38:14) {$$props.text}
    function fallback_block(ctx) {
    	let t_value = /*$$props*/ ctx[3].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$$props*/ 8 && t_value !== (t_value = /*$$props*/ ctx[3].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(38:14) {$$props.text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$$props*/ ctx[3].text != undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", /*classList*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$h, 35, 0, 1332);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*classList*/ 1) {
    				attr_dev(div, "class", /*classList*/ ctx[0]);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $gutter;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Col', slots, ['default']);
    	let { span = 24 } = $$props;
    	let classList = [];
    	let style = undefined;
    	let gutter = getContext("gutter");
    	validate_store(gutter, 'gutter');
    	component_subscribe($$self, gutter, value => $$invalidate(5, $gutter = value));

    	["span", "offset", "pull", "push"].forEach(prop => {
    		if ($$props[prop] || $$props[prop] === 0) {
    			classList.push(prop !== "span"
    			? `el-col-${prop}-${$$props[prop]}`
    			: `el-col-${$$props[prop]}`);
    		} else if (prop == "span") {
    			classList.push(`el-col-${span}`);
    		}
    	});

    	["xs", "sm", "md", "lg", "xl"].forEach(size => {
    		if (typeof $$props[size] === "object") {
    			let props = $$props[size];

    			Object.keys(props).forEach(prop => {
    				classList.push(prop !== "span"
    				? `el-col-${size}-${prop}-${props[prop]}`
    				: `el-col-${size}-${props[prop]}`);
    			});
    		} else if ($$props[size] || $$props[size] === 0) {
    			classList.push(`el-col-${size}-${$$props[size]}`);
    		}
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('span' in $$new_props) $$invalidate(4, span = $$new_props.span);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		getContext,
    		span,
    		classList,
    		style,
    		gutter,
    		$gutter
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ('span' in $$props) $$invalidate(4, span = $$new_props.span);
    		if ('classList' in $$props) $$invalidate(0, classList = $$new_props.classList);
    		if ('style' in $$props) $$invalidate(1, style = $$new_props.style);
    		if ('gutter' in $$props) $$invalidate(2, gutter = $$new_props.gutter);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		{
    			$$invalidate(1, style = Boolean($gutter)
    			? `padding-left: ${$gutter / 2}px; padding-right: ${$gutter / 2}px;`
    			: undefined);

    			$$invalidate(1, style = clsx({ [`${style}`]: style != undefined }, $$props["style"]));
    			$$invalidate(0, classList = clsx("el-col", classList, $$props["class"]));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		classList,
    		style,
    		gutter,
    		$$props,
    		span,
    		$gutter,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Col extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { span: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Col",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get span() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set span(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Container.svelte generated by Svelte v3.46.4 */
    const file$g = "src\\components\\Container.svelte";

    function create_fragment$i(ctx) {
    	let section;
    	let section_class_value;
    	let section_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			attr_dev(section, "class", section_class_value = clsx(['el-container', /*$$props*/ ctx[1]['class']]));
    			attr_dev(section, "style", section_style_value = /*$$props*/ ctx[1]['style']);
    			toggle_class(section, "is-vertical", /*direction*/ ctx[0]);
    			add_location(section, file$g, 29, 0, 709);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 2 && section_class_value !== (section_class_value = clsx(['el-container', /*$$props*/ ctx[1]['class']]))) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 2 && section_style_value !== (section_style_value = /*$$props*/ ctx[1]['style'])) {
    				attr_dev(section, "style", section_style_value);
    			}

    			if (dirty & /*$$props, direction*/ 3) {
    				toggle_class(section, "is-vertical", /*direction*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Container', slots, ['default']);
    	let { direction = undefined } = $$props;
    	const _isHeader = writable(0);
    	const _isFooter = writable(0);
    	setContext("isHeader", _isHeader);
    	setContext("isFooter", _isFooter);

    	onMount(() => {
    		let Header = get_store_value(_isHeader);
    		let Footer = get_store_value(_isFooter);

    		function isVertical() {
    			if (direction === "vertical") {
    				return true;
    			} else if (direction === "horizontal") {
    				return false;
    			}

    			return Header + Footer > 0 ? true : false;
    		}

    		$$invalidate(0, direction = isVertical());
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('direction' in $$new_props) $$invalidate(0, direction = $$new_props.direction);
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		setContext,
    		onMount,
    		writable,
    		get: get_store_value,
    		direction,
    		_isHeader,
    		_isFooter
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ('direction' in $$props) $$invalidate(0, direction = $$new_props.direction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [direction, $$props, $$scope, slots];
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { direction: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get direction() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.46.4 */
    const file$f = "src\\components\\Header.svelte";

    function create_fragment$h(ctx) {
    	let header;
    	let header_class_value;
    	let header_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			header = element("header");
    			if (default_slot) default_slot.c();
    			attr_dev(header, "class", header_class_value = clsx(['el-header', /*$$props*/ ctx[1]['class']]));
    			attr_dev(header, "style", header_style_value = /*$$props*/ ctx[1]['style']);
    			set_style(header, "height", /*height*/ ctx[0], false);
    			add_location(header, file$f, 8, 0, 213);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);

    			if (default_slot) {
    				default_slot.m(header, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 2 && header_class_value !== (header_class_value = clsx(['el-header', /*$$props*/ ctx[1]['class']]))) {
    				attr_dev(header, "class", header_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 2 && header_style_value !== (header_style_value = /*$$props*/ ctx[1]['style'])) {
    				attr_dev(header, "style", header_style_value);
    			}

    			if (dirty & /*height*/ 1) {
    				set_style(header, "height", /*height*/ ctx[0], false);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, ['default']);
    	let { height = '60px' } = $$props;
    	const isHeader = getContext("isHeader");
    	isHeader.set(1);

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('height' in $$new_props) $$invalidate(0, height = $$new_props.height);
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clsx, getContext, height, isHeader });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ('height' in $$props) $$invalidate(0, height = $$new_props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [height, $$props, $$scope, slots];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { height: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get height() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Main.svelte generated by Svelte v3.46.4 */
    const file$e = "src\\components\\Main.svelte";

    function create_fragment$g(ctx) {
    	let main;
    	let main_class_value;
    	let main_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (default_slot) default_slot.c();
    			attr_dev(main, "class", main_class_value = clsx('el-main', /*$$props*/ ctx[0]['class']));
    			attr_dev(main, "style", main_style_value = /*$$props*/ ctx[0]['style']);
    			add_location(main, file$e, 4, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 1 && main_class_value !== (main_class_value = clsx('el-main', /*$$props*/ ctx[0]['class']))) {
    				attr_dev(main, "class", main_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 1 && main_style_value !== (main_style_value = /*$$props*/ ctx[0]['style'])) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clsx });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, $$scope, slots];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.46.4 */
    const file$d = "src\\components\\Footer.svelte";

    function create_fragment$f(ctx) {
    	let footer;
    	let footer_class_value;
    	let footer_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			if (default_slot) default_slot.c();
    			attr_dev(footer, "class", footer_class_value = clsx("el-footer", /*$$props*/ ctx[1]["class"]));
    			attr_dev(footer, "style", footer_style_value = /*$$props*/ ctx[1]["style"]);
    			set_style(footer, "height", /*height*/ ctx[0], false);
    			add_location(footer, file$d, 8, 0, 214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);

    			if (default_slot) {
    				default_slot.m(footer, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 2 && footer_class_value !== (footer_class_value = clsx("el-footer", /*$$props*/ ctx[1]["class"]))) {
    				attr_dev(footer, "class", footer_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 2 && footer_style_value !== (footer_style_value = /*$$props*/ ctx[1]["style"])) {
    				attr_dev(footer, "style", footer_style_value);
    			}

    			if (dirty & /*height*/ 1) {
    				set_style(footer, "height", /*height*/ ctx[0], false);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, ['default']);
    	let { height = "60px" } = $$props;
    	const isFooter = getContext("isFooter");
    	isFooter.set(1);

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('height' in $$new_props) $$invalidate(0, height = $$new_props.height);
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clsx, getContext, height, isFooter });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ('height' in $$props) $$invalidate(0, height = $$new_props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [height, $$props, $$scope, slots];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { height: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get height() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Aside.svelte generated by Svelte v3.46.4 */
    const file$c = "src\\components\\Aside.svelte";

    function create_fragment$e(ctx) {
    	let aside;
    	let aside_class_value;
    	let aside_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			if (default_slot) default_slot.c();
    			attr_dev(aside, "class", aside_class_value = clsx("el-aside", /*$$props*/ ctx[1]["class"]));
    			attr_dev(aside, "style", aside_style_value = /*$$props*/ ctx[1]["style"]);
    			set_style(aside, "width", /*width*/ ctx[0], false);
    			add_location(aside, file$c, 5, 0, 104);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);

    			if (default_slot) {
    				default_slot.m(aside, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 2 && aside_class_value !== (aside_class_value = clsx("el-aside", /*$$props*/ ctx[1]["class"]))) {
    				attr_dev(aside, "class", aside_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 2 && aside_style_value !== (aside_style_value = /*$$props*/ ctx[1]["style"])) {
    				attr_dev(aside, "style", aside_style_value);
    			}

    			if (dirty & /*width*/ 1) {
    				set_style(aside, "width", /*width*/ ctx[0], false);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Aside', slots, ['default']);
    	let { width = "300px" } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('width' in $$new_props) $$invalidate(0, width = $$new_props.width);
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clsx, width });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ('width' in $$props) $$invalidate(0, width = $$new_props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [width, $$props, $$scope, slots];
    }

    class Aside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aside",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get width() {
    		throw new Error("<Aside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Aside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Icon.svelte generated by Svelte v3.46.4 */
    const file$b = "src\\components\\Icon.svelte";

    function create_fragment$d(ctx) {
    	let i;
    	let i_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (default_slot) default_slot.c();
    			attr_dev(i, "class", /*classList*/ ctx[0]);
    			attr_dev(i, "style", i_style_value = /*$$props*/ ctx[1]["style"]);
    			add_location(i, file$b, 7, 0, 318);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 2 && i_style_value !== (i_style_value = /*$$props*/ ctx[1]["style"])) {
    				attr_dev(i, "style", i_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, ['default']);
    	let { icon = undefined } = $$props;
    	let { name = undefined } = $$props;

    	let classList = clsx(
    		icon != undefined
    		? icon.substr(0, 8) == "el-icon-"
    			? icon
    			: `el-icon-${icon}`
    		: name != undefined ? `el-icon-${name}` : undefined,
    		$$props["class"]
    	);

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('icon' in $$new_props) $$invalidate(2, icon = $$new_props.icon);
    		if ('name' in $$new_props) $$invalidate(3, name = $$new_props.name);
    		if ('$$scope' in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clsx, icon, name, classList });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ('icon' in $$props) $$invalidate(2, icon = $$new_props.icon);
    		if ('name' in $$props) $$invalidate(3, name = $$new_props.name);
    		if ('classList' in $$props) $$invalidate(0, classList = $$new_props.classList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [classList, $$props, icon, name, $$scope, slots];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { icon: 2, name: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get icon() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Link.svelte generated by Svelte v3.46.4 */
    const file$a = "src\\components\\Link.svelte";

    // (24:4) {#if icon}
    function create_if_block_1$2(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");

    			attr_dev(i, "class", i_class_value = /*icon*/ ctx[1].substr(0, 8) == "el-icon-"
    			? /*icon*/ ctx[1]
    			: `el-icon-${/*icon*/ ctx[1]}`);

    			add_location(i, file$a, 24, 8, 810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 2 && i_class_value !== (i_class_value = /*icon*/ ctx[1].substr(0, 8) == "el-icon-"
    			? /*icon*/ ctx[1]
    			: `el-icon-${/*icon*/ ctx[1]}`)) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(24:4) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#if $$slots.default}
    function create_if_block$3(ctx) {
    	let span;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "el-link--inner");
    			add_location(span, file$a, 27, 8, 930);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(27:4) {#if $$slots.default}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let a;
    	let t;
    	let a_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[1] && create_if_block_1$2(ctx);
    	let if_block1 = /*$$slots*/ ctx[5].default && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(a, "class", /*classList*/ ctx[2]);
    			attr_dev(a, "style", a_style_value = /*$$props*/ ctx[4]["style"]);
    			attr_dev(a, "href", /*href*/ ctx[0]);
    			add_location(a, file$a, 22, 0, 708);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block0) if_block0.m(a, null);
    			append_dev(a, t);
    			if (if_block1) if_block1.m(a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*handleClick*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(a, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$$slots*/ ctx[5].default) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$$slots*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(a, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$$props*/ 16 && a_style_value !== (a_style_value = /*$$props*/ ctx[4]["style"])) {
    				attr_dev(a, "style", a_style_value);
    			}

    			if (!current || dirty & /*href*/ 1) {
    				attr_dev(a, "href", /*href*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { type = "default" } = $$props;
    	let { disabled = undefined } = $$props;
    	let { underline = true } = $$props;
    	let { href = undefined } = $$props;
    	let { icon = undefined } = $$props;
    	const dispatch = createEventDispatcher();

    	let classList = clsx(
    		[
    			"el-link",
    			type ? `el-link--${type}` : "",
    			disabled && "is-disabled",
    			underline && !disabled && "is-underline"
    		],
    		$$props["class"]
    	);

    	href = disabled == true ? undefined : href;

    	function handleClick() {
    		if (!disabled) {
    			if (!href) {
    				dispatch("click");
    			}
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('type' in $$new_props) $$invalidate(6, type = $$new_props.type);
    		if ('disabled' in $$new_props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ('underline' in $$new_props) $$invalidate(8, underline = $$new_props.underline);
    		if ('href' in $$new_props) $$invalidate(0, href = $$new_props.href);
    		if ('icon' in $$new_props) $$invalidate(1, icon = $$new_props.icon);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		createEventDispatcher,
    		type,
    		disabled,
    		underline,
    		href,
    		icon,
    		dispatch,
    		classList,
    		handleClick
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), $$new_props));
    		if ('type' in $$props) $$invalidate(6, type = $$new_props.type);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ('underline' in $$props) $$invalidate(8, underline = $$new_props.underline);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('icon' in $$props) $$invalidate(1, icon = $$new_props.icon);
    		if ('classList' in $$props) $$invalidate(2, classList = $$new_props.classList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		href,
    		icon,
    		classList,
    		handleClick,
    		$$props,
    		$$slots,
    		type,
    		disabled,
    		underline,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			type: 6,
    			disabled: 7,
    			underline: 8,
    			href: 0,
    			icon: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get type() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get underline() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set underline(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Radio.svelte generated by Svelte v3.46.4 */
    const file$9 = "src\\components\\Radio.svelte";

    // (79:8) {:else}
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 4) set_data_dev(t, /*label*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(79:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:36) 
    function create_if_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*text*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(77:36) ",
    		ctx
    	});

    	return block;
    }

    // (75:8) {#if $$slots.default}
    function create_if_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(75:8) {#if $$slots.default}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let label_1;
    	let span1;
    	let span0;
    	let t0;
    	let input;
    	let t1;
    	let span2;
    	let current_block_type_index;
    	let if_block;
    	let label_1_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_if_block_1$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$$slots*/ ctx[13].default) return 0;
    		if (/*text*/ ctx[1] != undefined) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			span1 = element("span");
    			span0 = element("span");
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			span2 = element("span");
    			if_block.c();
    			attr_dev(span0, "class", "el-radio__inner");
    			add_location(span0, file$9, 57, 8, 2229);
    			attr_dev(input, "class", "el-radio__original");
    			attr_dev(input, "type", "radio");
    			input.__value = /*label*/ ctx[2];
    			input.value = input.__value;
    			attr_dev(input, "aria-hidden", "true");
    			attr_dev(input, "name", /*name*/ ctx[3]);
    			input.disabled = /*isDisabled*/ ctx[5];
    			attr_dev(input, "tabindex", "-1");
    			attr_dev(input, "autocomplete", "off");
    			/*$$binding_groups*/ ctx[23][0].push(input);
    			add_location(input, file$9, 58, 8, 2271);
    			attr_dev(span1, "class", "el-radio__input");
    			toggle_class(span1, "is-disabled", /*isDisabled*/ ctx[5]);
    			toggle_class(span1, "is-checked", /*ischecked*/ ctx[6]);
    			add_location(span1, file$9, 56, 4, 2129);
    			attr_dev(span2, "class", "el-radio__label");
    			add_location(span2, file$9, 73, 4, 2707);
    			attr_dev(label_1, "class", /*classList*/ ctx[7]);
    			attr_dev(label_1, "style", label_1_style_value = /*$$props*/ ctx[12]["style"]);
    			attr_dev(label_1, "role", "radio");
    			attr_dev(label_1, "tabindex", /*tabindex*/ ctx[8]);
    			attr_dev(label_1, "aria-checked", /*ischecked*/ ctx[6]);
    			attr_dev(label_1, "aria-disabled", /*isDisabled*/ ctx[5]);
    			add_location(label_1, file$9, 55, 0, 1970);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, span1);
    			append_dev(span1, span0);
    			append_dev(span1, t0);
    			append_dev(span1, input);
    			input.checked = input.__value === /*value*/ ctx[0];
    			append_dev(label_1, t1);
    			append_dev(label_1, span2);
    			if_blocks[current_block_type_index].m(span2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[22]),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[24], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[25], false, false, false),
    					listen_dev(input, "change", /*handleChange*/ ctx[11], false, false, false),
    					listen_dev(span2, "keydown", stop_propagation(/*keydown_handler*/ ctx[21]), false, false, true),
    					listen_dev(label_1, "keydown", /*handleKeydown*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*label*/ 4) {
    				prop_dev(input, "__value", /*label*/ ctx[2]);
    				input.value = input.__value;
    			}

    			if (!current || dirty & /*name*/ 8) {
    				attr_dev(input, "name", /*name*/ ctx[3]);
    			}

    			if (!current || dirty & /*isDisabled*/ 32) {
    				prop_dev(input, "disabled", /*isDisabled*/ ctx[5]);
    			}

    			if (dirty & /*value*/ 1) {
    				input.checked = input.__value === /*value*/ ctx[0];
    			}

    			if (dirty & /*isDisabled*/ 32) {
    				toggle_class(span1, "is-disabled", /*isDisabled*/ ctx[5]);
    			}

    			if (dirty & /*ischecked*/ 64) {
    				toggle_class(span1, "is-checked", /*ischecked*/ ctx[6]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(span2, null);
    			}

    			if (!current || dirty & /*classList*/ 128) {
    				attr_dev(label_1, "class", /*classList*/ ctx[7]);
    			}

    			if (!current || dirty & /*$$props*/ 4096 && label_1_style_value !== (label_1_style_value = /*$$props*/ ctx[12]["style"])) {
    				attr_dev(label_1, "style", label_1_style_value);
    			}

    			if (!current || dirty & /*tabindex*/ 256) {
    				attr_dev(label_1, "tabindex", /*tabindex*/ ctx[8]);
    			}

    			if (!current || dirty & /*ischecked*/ 64) {
    				attr_dev(label_1, "aria-checked", /*ischecked*/ ctx[6]);
    			}

    			if (!current || dirty & /*isDisabled*/ 32) {
    				attr_dev(label_1, "aria-disabled", /*isDisabled*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			/*$$binding_groups*/ ctx[23][0].splice(/*$$binding_groups*/ ctx[23][0].indexOf(input), 1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let RadioGroup_value;
    	let ischecked;
    	let isDisabled;
    	let tabindex;
    	let classList;
    	let $writable_value;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Radio', slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { text = undefined } = $$props;
    	let { value = undefined } = $$props;
    	let { label = undefined } = $$props;
    	let { disabled = false } = $$props;
    	let { border = false } = $$props;
    	let { size = undefined } = $$props;
    	let { name = undefined } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_value = getContext("RadioGroup_value");
    	validate_store(writable_value, 'writable_value');
    	component_subscribe($$self, writable_value, value => $$invalidate(18, $writable_value = value));
    	const RadioGroup_props = getContext("RadioGroup_props");
    	const RadioGroup_disabled = getContext("RadioGroup_disabled");
    	const RadioGroup_change = getContext("RadioGroup_change");

    	if (RadioGroup_props != undefined) {
    		size = RadioGroup_props.size;
    	}

    	let focus = false;

    	const isGroup = () => {
    		return RadioGroup_value != undefined ? true : false;
    	};

    	function handleKeydown(e) {
    		if (e.code !== "Space") {
    			return;
    		}

    		$$invalidate(0, value = isDisabled ? value : label);
    		e.stopPropagation();
    		e.preventDefault();
    	}

    	function handleChange(e) {
    		$$invalidate(0, value = label);
    		dispatch("change", e);

    		if (RadioGroup_value != undefined) {
    			RadioGroup_change(value);
    		}
    	}

    	const $$binding_groups = [[]];

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_change_handler() {
    		value = this.__value;
    		(($$invalidate(0, value), $$invalidate(17, RadioGroup_value)), $$invalidate(18, $writable_value));
    	}

    	const focus_handler = () => $$invalidate(4, focus = true);
    	const blur_handler = () => $$invalidate(4, focus = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('text' in $$new_props) $$invalidate(1, text = $$new_props.text);
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('label' in $$new_props) $$invalidate(2, label = $$new_props.label);
    		if ('disabled' in $$new_props) $$invalidate(15, disabled = $$new_props.disabled);
    		if ('border' in $$new_props) $$invalidate(16, border = $$new_props.border);
    		if ('size' in $$new_props) $$invalidate(14, size = $$new_props.size);
    		if ('name' in $$new_props) $$invalidate(3, name = $$new_props.name);
    		if ('$$scope' in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		text,
    		value,
    		label,
    		disabled,
    		border,
    		size,
    		name,
    		getContext,
    		createEventDispatcher,
    		dispatch,
    		writable_value,
    		RadioGroup_props,
    		RadioGroup_disabled,
    		RadioGroup_change,
    		focus,
    		isGroup,
    		handleKeydown,
    		handleChange,
    		RadioGroup_value,
    		isDisabled,
    		ischecked,
    		classList,
    		tabindex,
    		$writable_value
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    		if ('text' in $$props) $$invalidate(1, text = $$new_props.text);
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('label' in $$props) $$invalidate(2, label = $$new_props.label);
    		if ('disabled' in $$props) $$invalidate(15, disabled = $$new_props.disabled);
    		if ('border' in $$props) $$invalidate(16, border = $$new_props.border);
    		if ('size' in $$props) $$invalidate(14, size = $$new_props.size);
    		if ('name' in $$props) $$invalidate(3, name = $$new_props.name);
    		if ('focus' in $$props) $$invalidate(4, focus = $$new_props.focus);
    		if ('RadioGroup_value' in $$props) $$invalidate(17, RadioGroup_value = $$new_props.RadioGroup_value);
    		if ('isDisabled' in $$props) $$invalidate(5, isDisabled = $$new_props.isDisabled);
    		if ('ischecked' in $$props) $$invalidate(6, ischecked = $$new_props.ischecked);
    		if ('classList' in $$props) $$invalidate(7, classList = $$new_props.classList);
    		if ('tabindex' in $$props) $$invalidate(8, tabindex = $$new_props.tabindex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$writable_value*/ 262144) {
    			$$invalidate(17, RadioGroup_value = $writable_value);
    		}

    		if ($$self.$$.dirty & /*RadioGroup_value, value*/ 131073) {
    			$$invalidate(0, value = isGroup() ? RadioGroup_value : value);
    		}

    		if ($$self.$$.dirty & /*value, label*/ 5) {
    			$$invalidate(6, ischecked = value === label ? true : false);
    		}

    		if ($$self.$$.dirty & /*disabled*/ 32768) {
    			$$invalidate(5, isDisabled = isGroup() ? RadioGroup_disabled || disabled : disabled);
    		}

    		if ($$self.$$.dirty & /*isDisabled, value, label*/ 37) {
    			$$invalidate(8, tabindex = isDisabled || isDisabled && value !== label ? -1 : 0);
    		}

    		$$invalidate(7, classList = clsx(
    			"el-radio",
    			[
    				border && size != undefined ? `el-radio--${size}` : "",
    				{ "is-disabled": isDisabled },
    				{ "is-focus": focus },
    				{ "is-bordered": border },
    				{ "is-checked": ischecked }
    			],
    			$$props["class"]
    		));
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		text,
    		label,
    		name,
    		focus,
    		isDisabled,
    		ischecked,
    		classList,
    		tabindex,
    		writable_value,
    		handleKeydown,
    		handleChange,
    		$$props,
    		$$slots,
    		size,
    		disabled,
    		border,
    		RadioGroup_value,
    		$writable_value,
    		$$scope,
    		slots,
    		keydown_handler,
    		input_change_handler,
    		$$binding_groups,
    		focus_handler,
    		blur_handler
    	];
    }

    class Radio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			text: 1,
    			value: 0,
    			label: 2,
    			disabled: 15,
    			border: 16,
    			size: 14,
    			name: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Radio",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get text() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get border() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set border(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\RadioButton.svelte generated by Svelte v3.46.4 */
    const file$8 = "src\\components\\RadioButton.svelte";

    // (86:8) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*label*/ 4) set_data_dev(t, /*label*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(86:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:36) 
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*text*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(84:36) ",
    		ctx
    	});

    	return block;
    }

    // (82:8) {#if $$slots.default}
    function create_if_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[21].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 1048576)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[20],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[20])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[20], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(82:8) {#if $$slots.default}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let label_1;
    	let input;
    	let t;
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let label_1_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_if_block_1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$$slots*/ ctx[14].default) return 0;
    		if (/*text*/ ctx[1] != undefined) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			input = element("input");
    			t = space();
    			span = element("span");
    			if_block.c();
    			attr_dev(input, "class", "el-radio-button__orig-radio");
    			attr_dev(input, "type", "radio");
    			input.__value = /*label*/ ctx[2];
    			input.value = input.__value;
    			attr_dev(input, "aria-hidden", "true");
    			attr_dev(input, "name", /*name*/ ctx[3]);
    			input.disabled = /*isDisabled*/ ctx[6];
    			attr_dev(input, "tabindex", "-1");
    			attr_dev(input, "autocomplete", "off");
    			/*$$binding_groups*/ ctx[24][0].push(input);
    			add_location(input, file$8, 65, 4, 2566);
    			attr_dev(span, "class", "el-radio-button__inner");
    			attr_dev(span, "style", /*styleList*/ ctx[7]);
    			add_location(span, file$8, 80, 4, 2948);
    			attr_dev(label_1, "class", /*classList*/ ctx[8]);
    			attr_dev(label_1, "style", label_1_style_value = /*$$props*/ ctx[13]["style"]);
    			attr_dev(label_1, "role", "radio");
    			attr_dev(label_1, "tabindex", /*tabindex*/ ctx[9]);
    			attr_dev(label_1, "aria-checked", /*ischecked*/ ctx[5]);
    			attr_dev(label_1, "aria-disabled", /*isDisabled*/ ctx[6]);
    			add_location(label_1, file$8, 64, 0, 2407);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, input);
    			input.checked = input.__value === /*value*/ ctx[0];
    			append_dev(label_1, t);
    			append_dev(label_1, span);
    			if_blocks[current_block_type_index].m(span, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[23]),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[25], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[26], false, false, false),
    					listen_dev(input, "change", /*handleChange*/ ctx[12], false, false, false),
    					listen_dev(span, "keydown", stop_propagation(/*keydown_handler*/ ctx[22]), false, false, true),
    					listen_dev(label_1, "keydown", /*handleKeydown*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*label*/ 4) {
    				prop_dev(input, "__value", /*label*/ ctx[2]);
    				input.value = input.__value;
    			}

    			if (!current || dirty[0] & /*name*/ 8) {
    				attr_dev(input, "name", /*name*/ ctx[3]);
    			}

    			if (!current || dirty[0] & /*isDisabled*/ 64) {
    				prop_dev(input, "disabled", /*isDisabled*/ ctx[6]);
    			}

    			if (dirty[0] & /*value*/ 1) {
    				input.checked = input.__value === /*value*/ ctx[0];
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(span, null);
    			}

    			if (!current || dirty[0] & /*styleList*/ 128) {
    				attr_dev(span, "style", /*styleList*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*classList*/ 256) {
    				attr_dev(label_1, "class", /*classList*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*$$props*/ 8192 && label_1_style_value !== (label_1_style_value = /*$$props*/ ctx[13]["style"])) {
    				attr_dev(label_1, "style", label_1_style_value);
    			}

    			if (!current || dirty[0] & /*tabindex*/ 512) {
    				attr_dev(label_1, "tabindex", /*tabindex*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*ischecked*/ 32) {
    				attr_dev(label_1, "aria-checked", /*ischecked*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*isDisabled*/ 64) {
    				attr_dev(label_1, "aria-disabled", /*isDisabled*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			/*$$binding_groups*/ ctx[24][0].splice(/*$$binding_groups*/ ctx[24][0].indexOf(input), 1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let RadioGroup_value;
    	let ischecked;
    	let isDisabled;
    	let tabindex;
    	let classList;
    	let sy0;
    	let styleList;
    	let $writable_value;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RadioButton', slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { text = undefined } = $$props;
    	let { value = undefined } = $$props;
    	let { label = undefined } = $$props;
    	let { disabled = false } = $$props;
    	let { size = undefined } = $$props;
    	let { name = undefined } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_value = getContext("RadioGroup_value");
    	validate_store(writable_value, 'writable_value');
    	component_subscribe($$self, writable_value, value => $$invalidate(19, $writable_value = value));
    	const RadioGroup_props = getContext("RadioGroup_props");
    	const RadioGroup_disabled = getContext("RadioGroup_disabled");
    	const RadioGroup_change = getContext("RadioGroup_change");

    	if (RadioGroup_props != undefined) {
    		size = RadioGroup_props.size;
    	}

    	let focus = false;

    	const isGroup = () => {
    		return RadioGroup_value != undefined ? true : false;
    	};

    	function handleKeydown(e) {
    		if (e.code !== "Space") {
    			return;
    		}

    		$$invalidate(0, value = isDisabled ? value : label);
    		e.stopPropagation();
    		e.preventDefault();
    	}

    	function handleChange(e) {
    		$$invalidate(0, value = label);
    		dispatch("change", e);

    		if (RadioGroup_value != undefined) {
    			RadioGroup_change(value);
    		}
    	}

    	let isprops = RadioGroup_props != undefined;
    	let sy1 = isprops && RadioGroup_props.fill || "";
    	let sy2 = isprops && RadioGroup_props.textcolor || "";
    	const $$binding_groups = [[]];

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_change_handler() {
    		value = this.__value;
    		(($$invalidate(0, value), $$invalidate(18, RadioGroup_value)), $$invalidate(19, $writable_value));
    	}

    	const focus_handler = () => $$invalidate(4, focus = true);
    	const blur_handler = () => $$invalidate(4, focus = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('text' in $$new_props) $$invalidate(1, text = $$new_props.text);
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('label' in $$new_props) $$invalidate(2, label = $$new_props.label);
    		if ('disabled' in $$new_props) $$invalidate(16, disabled = $$new_props.disabled);
    		if ('size' in $$new_props) $$invalidate(15, size = $$new_props.size);
    		if ('name' in $$new_props) $$invalidate(3, name = $$new_props.name);
    		if ('$$scope' in $$new_props) $$invalidate(20, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		text,
    		value,
    		label,
    		disabled,
    		size,
    		name,
    		getContext,
    		createEventDispatcher,
    		dispatch,
    		writable_value,
    		RadioGroup_props,
    		RadioGroup_disabled,
    		RadioGroup_change,
    		focus,
    		isGroup,
    		handleKeydown,
    		handleChange,
    		isprops,
    		sy1,
    		sy2,
    		sy0,
    		styleList,
    		ischecked,
    		RadioGroup_value,
    		isDisabled,
    		classList,
    		tabindex,
    		$writable_value
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ('text' in $$props) $$invalidate(1, text = $$new_props.text);
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('label' in $$props) $$invalidate(2, label = $$new_props.label);
    		if ('disabled' in $$props) $$invalidate(16, disabled = $$new_props.disabled);
    		if ('size' in $$props) $$invalidate(15, size = $$new_props.size);
    		if ('name' in $$props) $$invalidate(3, name = $$new_props.name);
    		if ('focus' in $$props) $$invalidate(4, focus = $$new_props.focus);
    		if ('isprops' in $$props) $$invalidate(32, isprops = $$new_props.isprops);
    		if ('sy1' in $$props) $$invalidate(33, sy1 = $$new_props.sy1);
    		if ('sy2' in $$props) $$invalidate(34, sy2 = $$new_props.sy2);
    		if ('sy0' in $$props) $$invalidate(17, sy0 = $$new_props.sy0);
    		if ('styleList' in $$props) $$invalidate(7, styleList = $$new_props.styleList);
    		if ('ischecked' in $$props) $$invalidate(5, ischecked = $$new_props.ischecked);
    		if ('RadioGroup_value' in $$props) $$invalidate(18, RadioGroup_value = $$new_props.RadioGroup_value);
    		if ('isDisabled' in $$props) $$invalidate(6, isDisabled = $$new_props.isDisabled);
    		if ('classList' in $$props) $$invalidate(8, classList = $$new_props.classList);
    		if ('tabindex' in $$props) $$invalidate(9, tabindex = $$new_props.tabindex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$writable_value*/ 524288) {
    			$$invalidate(18, RadioGroup_value = $writable_value);
    		}

    		if ($$self.$$.dirty[0] & /*RadioGroup_value, value*/ 262145) {
    			$$invalidate(0, value = isGroup() ? RadioGroup_value : value);
    		}

    		if ($$self.$$.dirty[0] & /*value, label*/ 5) {
    			$$invalidate(5, ischecked = value === label ? true : false);
    		}

    		if ($$self.$$.dirty[0] & /*disabled*/ 65536) {
    			$$invalidate(6, isDisabled = isGroup() ? RadioGroup_disabled || disabled : disabled);
    		}

    		if ($$self.$$.dirty[0] & /*isDisabled, value, label*/ 69) {
    			$$invalidate(9, tabindex = isDisabled || isDisabled && value !== label ? -1 : 0);
    		}

    		$$invalidate(8, classList = clsx(
    			"el-radio-button",
    			[
    				size != undefined ? `el-radio-button--${size}` : "",
    				{ "is-active": ischecked },
    				{ "is-disabled": isDisabled },
    				{ "is-focus": focus }
    			],
    			$$props["class"]
    		));

    		if ($$self.$$.dirty[0] & /*ischecked*/ 32) {
    			$$invalidate(17, sy0 = ischecked
    			? isprops && RadioGroup_props.fill || ""
    			: isprops && RadioGroup_props.backgroundcolor || "");
    		}

    		if ($$self.$$.dirty[0] & /*sy0*/ 131072) {
    			$$invalidate(7, styleList = clsx({
    				[`background-color:${sy0};`]: isprops,
    				[`border-color:${sy1};`]: isprops,
    				[`box-shadow:-1px 0 0 0 ${sy1};`]: isprops,
    				[`color:${sy2};`]: isprops
    			}));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		text,
    		label,
    		name,
    		focus,
    		ischecked,
    		isDisabled,
    		styleList,
    		classList,
    		tabindex,
    		writable_value,
    		handleKeydown,
    		handleChange,
    		$$props,
    		$$slots,
    		size,
    		disabled,
    		sy0,
    		RadioGroup_value,
    		$writable_value,
    		$$scope,
    		slots,
    		keydown_handler,
    		input_change_handler,
    		$$binding_groups,
    		focus_handler,
    		blur_handler
    	];
    }

    class RadioButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				text: 1,
    				value: 0,
    				label: 2,
    				disabled: 16,
    				size: 15,
    				name: 3
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RadioButton",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get text() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\RadioGroup.svelte generated by Svelte v3.46.4 */
    const file$7 = "src\\components\\RadioGroup.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[20] = list;
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (61:4) {:else}
    function create_else_block_1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(61:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (58:8) {:else}
    function create_else_block(ctx) {
    	let radiobutton;
    	let updating_value;
    	let current;

    	function radiobutton_value_binding(value) {
    		/*radiobutton_value_binding*/ ctx[14](value, /*radio*/ ctx[19]);
    	}

    	let radiobutton_props = {
    		label: /*radio*/ ctx[19].label,
    		disabled: /*disabled*/ ctx[1] || /*radio*/ ctx[19].disabled,
    		size: /*size*/ ctx[0],
    		text: /*radio*/ ctx[19].text || /*radio*/ ctx[19].label || /*radio*/ ctx[19].value
    	};

    	if (/*radio*/ ctx[19].value !== void 0) {
    		radiobutton_props.value = /*radio*/ ctx[19].value;
    	}

    	radiobutton = new RadioButton({ props: radiobutton_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiobutton, 'value', radiobutton_value_binding));
    	radiobutton.$on("change", /*change_handler_1*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(radiobutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiobutton, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const radiobutton_changes = {};
    			if (dirty & /*propList*/ 8) radiobutton_changes.label = /*radio*/ ctx[19].label;
    			if (dirty & /*disabled, propList*/ 10) radiobutton_changes.disabled = /*disabled*/ ctx[1] || /*radio*/ ctx[19].disabled;
    			if (dirty & /*size*/ 1) radiobutton_changes.size = /*size*/ ctx[0];
    			if (dirty & /*propList*/ 8) radiobutton_changes.text = /*radio*/ ctx[19].text || /*radio*/ ctx[19].label || /*radio*/ ctx[19].value;

    			if (!updating_value && dirty & /*propList*/ 8) {
    				updating_value = true;
    				radiobutton_changes.value = /*radio*/ ctx[19].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			radiobutton.$set(radiobutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiobutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(58:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:8) {#if type == "radio"}
    function create_if_block(ctx) {
    	let radio;
    	let updating_value;
    	let current;

    	function radio_value_binding(value) {
    		/*radio_value_binding*/ ctx[12](value, /*radio*/ ctx[19]);
    	}

    	let radio_props = {
    		label: /*radio*/ ctx[19].label,
    		disabled: /*disabled*/ ctx[1] || /*radio*/ ctx[19].disabled,
    		size: /*size*/ ctx[0],
    		text: /*radio*/ ctx[19].text || /*radio*/ ctx[19].label || /*radio*/ ctx[19].value
    	};

    	if (/*radio*/ ctx[19].value !== void 0) {
    		radio_props.value = /*radio*/ ctx[19].value;
    	}

    	radio = new Radio({ props: radio_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio, 'value', radio_value_binding));
    	radio.$on("change", /*change_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(radio.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const radio_changes = {};
    			if (dirty & /*propList*/ 8) radio_changes.label = /*radio*/ ctx[19].label;
    			if (dirty & /*disabled, propList*/ 10) radio_changes.disabled = /*disabled*/ ctx[1] || /*radio*/ ctx[19].disabled;
    			if (dirty & /*size*/ 1) radio_changes.size = /*size*/ ctx[0];
    			if (dirty & /*propList*/ 8) radio_changes.text = /*radio*/ ctx[19].text || /*radio*/ ctx[19].label || /*radio*/ ctx[19].value;

    			if (!updating_value && dirty & /*propList*/ 8) {
    				updating_value = true;
    				radio_changes.value = /*radio*/ ctx[19].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			radio.$set(radio_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(56:8) {#if type == \\\"radio\\\"}",
    		ctx
    	});

    	return block;
    }

    // (55:4) {#each propList as radio, index}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[2] == "radio") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(55:4) {#each propList as radio, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	let each_value = /*propList*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "class", div_class_value = clsx("el-radio-group", /*$$props*/ ctx[4]["class"]));
    			attr_dev(div, "style", div_style_value = /*$$props*/ ctx[4]["style"]);
    			attr_dev(div, "role", "radiogroup");
    			add_location(div, file$7, 53, 0, 1849);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*propList, disabled, size, type, $$scope*/ 1039) {
    				each_value = /*propList*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block_1(ctx);
    					each_1_else.c();
    					transition_in(each_1_else, 1);
    					each_1_else.m(div, null);
    				} else if (each_1_else) {
    					group_outros();

    					transition_out(each_1_else, 1, 1, () => {
    						each_1_else = null;
    					});

    					check_outros();
    				}
    			}

    			if (!current || dirty & /*$$props*/ 16 && div_class_value !== (div_class_value = clsx("el-radio-group", /*$$props*/ ctx[4]["class"]))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 16 && div_style_value !== (div_style_value = /*$$props*/ ctx[4]["style"])) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RadioGroup', slots, ['default']);
    	let { value = undefined } = $$props;
    	let { size = undefined } = $$props;
    	let { fill = "#409EFF" } = $$props;
    	let { textcolor = "#ffffff" } = $$props;
    	let { backgroundcolor = "#ffffff" } = $$props;
    	let { disabled = false } = $$props;
    	let { radiodata = [] } = $$props;
    	let { type = "radio" } = $$props;
    	const dispatch = createEventDispatcher();
    	const RadioGroup_value = writable(value);
    	setContext("RadioGroup_props", $$props);
    	setContext("RadioGroup_value", RadioGroup_value);
    	setContext("RadioGroup_disabled", disabled);
    	setContext("RadioGroup_change", handleChange);

    	function handleChange(e) {
    		RadioGroup_value.set(e);
    		dispatch("change", e);
    	}

    	let propList = [];

    	for (let index = 0; index < radiodata.length; index++) {
    		const prop = {};
    		const radio = radiodata[index];

    		if (typeof radio === "string") {
    			prop.value = radio;
    			prop.label = radio;
    			propList.push(prop);
    			continue;
    		}

    		if (typeof radio === "object") {
    			if ("value" in radio === false && "label" in radio === false) {
    				continue;
    			}

    			prop.value = radio.value || String(radio.label);
    			prop.label = String(radio.label) || radio.value;
    			prop.disabled = radio.disabled == true ? true : false;
    			prop.text = radio.text != undefined ? radio.text : "";
    			propList.push(prop);
    		}
    	}

    	function radio_value_binding(value, radio) {
    		if ($$self.$$.not_equal(radio.value, value)) {
    			radio.value = value;
    			$$invalidate(3, propList);
    		}
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function radiobutton_value_binding(value, radio) {
    		if ($$self.$$.not_equal(radio.value, value)) {
    			radio.value = value;
    			$$invalidate(3, propList);
    		}
    	}

    	function change_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('value' in $$new_props) $$invalidate(5, value = $$new_props.value);
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('fill' in $$new_props) $$invalidate(6, fill = $$new_props.fill);
    		if ('textcolor' in $$new_props) $$invalidate(7, textcolor = $$new_props.textcolor);
    		if ('backgroundcolor' in $$new_props) $$invalidate(8, backgroundcolor = $$new_props.backgroundcolor);
    		if ('disabled' in $$new_props) $$invalidate(1, disabled = $$new_props.disabled);
    		if ('radiodata' in $$new_props) $$invalidate(9, radiodata = $$new_props.radiodata);
    		if ('type' in $$new_props) $$invalidate(2, type = $$new_props.type);
    		if ('$$scope' in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		setContext,
    		createEventDispatcher,
    		writable,
    		Radio,
    		RadioButton,
    		value,
    		size,
    		fill,
    		textcolor,
    		backgroundcolor,
    		disabled,
    		radiodata,
    		type,
    		dispatch,
    		RadioGroup_value,
    		handleChange,
    		propList
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), $$new_props));
    		if ('value' in $$props) $$invalidate(5, value = $$new_props.value);
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('fill' in $$props) $$invalidate(6, fill = $$new_props.fill);
    		if ('textcolor' in $$props) $$invalidate(7, textcolor = $$new_props.textcolor);
    		if ('backgroundcolor' in $$props) $$invalidate(8, backgroundcolor = $$new_props.backgroundcolor);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$new_props.disabled);
    		if ('radiodata' in $$props) $$invalidate(9, radiodata = $$new_props.radiodata);
    		if ('type' in $$props) $$invalidate(2, type = $$new_props.type);
    		if ('propList' in $$props) $$invalidate(3, propList = $$new_props.propList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		size,
    		disabled,
    		type,
    		propList,
    		$$props,
    		value,
    		fill,
    		textcolor,
    		backgroundcolor,
    		radiodata,
    		$$scope,
    		slots,
    		radio_value_binding,
    		change_handler,
    		radiobutton_value_binding,
    		change_handler_1
    	];
    }

    class RadioGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			value: 5,
    			size: 0,
    			fill: 6,
    			textcolor: 7,
    			backgroundcolor: 8,
    			disabled: 1,
    			radiodata: 9,
    			type: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RadioGroup",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get value() {
    		throw new Error("<RadioGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<RadioGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<RadioGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<RadioGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fill() {
    		throw new Error("<RadioGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<RadioGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textcolor() {
    		throw new Error("<RadioGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textcolor(value) {
    		throw new Error("<RadioGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundcolor() {
    		throw new Error("<RadioGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundcolor(value) {
    		throw new Error("<RadioGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<RadioGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<RadioGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radiodata() {
    		throw new Error("<RadioGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radiodata(value) {
    		throw new Error("<RadioGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<RadioGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<RadioGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\doc\Index.svelte generated by Svelte v3.46.4 */
    const file$6 = "src\\doc\\Index.svelte";

    // (5:4) <Col>
    function create_default_slot_6$5(ctx) {
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			t0 = text("官方的文档连接：");
    			a = element("a");
    			a.textContent = "链接地址";
    			attr_dev(a, "href", "https://element.eleme.cn/#/zh-CN/component/installation");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 4, 17, 94);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$5.name,
    		type: "slot",
    		source: "(5:4) <Col>",
    		ctx
    	});

    	return block;
    }

    // (4:0) <Row>
    function create_default_slot_5$5(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let t2;
    	let col3;
    	let current;

    	col0 = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_6$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: { text: "svelte的版本劲量与官方做到一致，纯属为了学习" },
    			$$inline: true
    		});

    	col2 = new Col({
    			props: { text: "2022年3月5日21:08:50" },
    			$$inline: true
    		});

    	col3 = new Col({ props: { text: "" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    			t2 = space();
    			create_component(col3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(col3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			transition_in(col3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			transition_out(col3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(col3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$5.name,
    		type: "slot",
    		source: "(4:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (10:0) <Row>
    function create_default_slot_4$5(ctx) {
    	let a;
    	let button;
    	let current;

    	button = new Button({
    			props: { text: "Layout布局" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", "#/row");
    			add_location(a, file$6, 9, 5, 307);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			mount_component(button, a, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$5.name,
    		type: "slot",
    		source: "(10:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (11:0) <Row>
    function create_default_slot_3$5(ctx) {
    	let a;
    	let button;
    	let current;

    	button = new Button({
    			props: { text: "Container布局容器" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", "#/Container");
    			add_location(a, file$6, 10, 5, 365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			mount_component(button, a, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$5.name,
    		type: "slot",
    		source: "(11:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Row>
    function create_default_slot_2$5(ctx) {
    	let a;
    	let button;
    	let current;

    	button = new Button({
    			props: { text: "Icon图标" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", "#/icon");
    			add_location(a, file$6, 11, 5, 434);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			mount_component(button, a, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(12:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (13:0) <Row>
    function create_default_slot_1$5(ctx) {
    	let a;
    	let button;
    	let current;

    	button = new Button({
    			props: { text: "Button按钮" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", "#/button");
    			add_location(a, file$6, 12, 5, 491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			mount_component(button, a, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(13:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (14:0) <Row>
    function create_default_slot$6(ctx) {
    	let a;
    	let button;
    	let current;

    	button = new Button({
    			props: { text: "Link 文字链接" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(button.$$.fragment);
    			attr_dev(a, "href", "#/link");
    			add_location(a, file$6, 13, 5, 552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			mount_component(button, a, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(14:0) <Row>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let row0;
    	let t0;
    	let row1;
    	let t1;
    	let row2;
    	let t2;
    	let row3;
    	let t3;
    	let row4;
    	let t4;
    	let row5;
    	let current;

    	row0 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_5$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row1 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_4$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row2 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_3$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row3 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row4 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row5 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t0 = space();
    			create_component(row1.$$.fragment);
    			t1 = space();
    			create_component(row2.$$.fragment);
    			t2 = space();
    			create_component(row3.$$.fragment);
    			t3 = space();
    			create_component(row4.$$.fragment);
    			t4 = space();
    			create_component(row5.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(row2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(row3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(row4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(row5, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const row0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    			const row2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row2_changes.$$scope = { dirty, ctx };
    			}

    			row2.$set(row2_changes);
    			const row3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row3_changes.$$scope = { dirty, ctx };
    			}

    			row3.$set(row3_changes);
    			const row4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row4_changes.$$scope = { dirty, ctx };
    			}

    			row4.$set(row4_changes);
    			const row5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row5_changes.$$scope = { dirty, ctx };
    			}

    			row5.$set(row5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(row2.$$.fragment, local);
    			transition_in(row3.$$.fragment, local);
    			transition_in(row4.$$.fragment, local);
    			transition_in(row5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(row2.$$.fragment, local);
    			transition_out(row3.$$.fragment, local);
    			transition_out(row4.$$.fragment, local);
    			transition_out(row5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(row1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(row2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(row3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(row4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(row5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Index', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Row, Col, Button });
    	return [];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\doc\Button.svelte generated by Svelte v3.46.4 */
    const file$5 = "src\\doc\\Button.svelte";

    // (12:1) <Button on:click={onclick}>
    function create_default_slot_46$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("默认按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_46$2.name,
    		type: "slot",
    		source: "(12:1) <Button on:click={onclick}>",
    		ctx
    	});

    	return block;
    }

    // (13:1) <Button type="primary">
    function create_default_slot_45$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("主要按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_45$2.name,
    		type: "slot",
    		source: "(13:1) <Button type=\\\"primary\\\">",
    		ctx
    	});

    	return block;
    }

    // (14:1) <Button type="success">
    function create_default_slot_44$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("成功按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_44$2.name,
    		type: "slot",
    		source: "(14:1) <Button type=\\\"success\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:1) <Button type="info">
    function create_default_slot_43$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("信息按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_43$2.name,
    		type: "slot",
    		source: "(15:1) <Button type=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:1) <Button type="warning">
    function create_default_slot_42$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("警告按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_42$2.name,
    		type: "slot",
    		source: "(16:1) <Button type=\\\"warning\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:1) <Button type="danger">
    function create_default_slot_41$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("危险按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_41$2.name,
    		type: "slot",
    		source: "(17:1) <Button type=\\\"danger\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:1) <Button plain>
    function create_default_slot_40$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("朴素按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_40$2.name,
    		type: "slot",
    		source: "(20:1) <Button plain>",
    		ctx
    	});

    	return block;
    }

    // (21:1) <Button type="primary" plain>
    function create_default_slot_39$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("主要按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_39$2.name,
    		type: "slot",
    		source: "(21:1) <Button type=\\\"primary\\\" plain>",
    		ctx
    	});

    	return block;
    }

    // (22:1) <Button type="success" plain>
    function create_default_slot_38$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("成功按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_38$2.name,
    		type: "slot",
    		source: "(22:1) <Button type=\\\"success\\\" plain>",
    		ctx
    	});

    	return block;
    }

    // (23:1) <Button type="info" plain>
    function create_default_slot_37$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("信息按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_37$2.name,
    		type: "slot",
    		source: "(23:1) <Button type=\\\"info\\\" plain>",
    		ctx
    	});

    	return block;
    }

    // (24:1) <Button type="warning" plain>
    function create_default_slot_36$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("警告按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_36$2.name,
    		type: "slot",
    		source: "(24:1) <Button type=\\\"warning\\\" plain>",
    		ctx
    	});

    	return block;
    }

    // (25:1) <Button type="danger" plain>
    function create_default_slot_35$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("危险按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_35$2.name,
    		type: "slot",
    		source: "(25:1) <Button type=\\\"danger\\\" plain>",
    		ctx
    	});

    	return block;
    }

    // (28:1) <Button round>
    function create_default_slot_34$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("圆角按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_34$2.name,
    		type: "slot",
    		source: "(28:1) <Button round>",
    		ctx
    	});

    	return block;
    }

    // (29:1) <Button type="primary" round>
    function create_default_slot_33$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("主要按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_33$2.name,
    		type: "slot",
    		source: "(29:1) <Button type=\\\"primary\\\" round>",
    		ctx
    	});

    	return block;
    }

    // (30:1) <Button type="success" round>
    function create_default_slot_32$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("成功按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_32$3.name,
    		type: "slot",
    		source: "(30:1) <Button type=\\\"success\\\" round>",
    		ctx
    	});

    	return block;
    }

    // (31:1) <Button type="info" round>
    function create_default_slot_31$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("信息按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_31$3.name,
    		type: "slot",
    		source: "(31:1) <Button type=\\\"info\\\" round>",
    		ctx
    	});

    	return block;
    }

    // (32:1) <Button type="warning" round>
    function create_default_slot_30$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("警告按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_30$3.name,
    		type: "slot",
    		source: "(32:1) <Button type=\\\"warning\\\" round>",
    		ctx
    	});

    	return block;
    }

    // (33:1) <Button type="danger" round>
    function create_default_slot_29$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("危险按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_29$3.name,
    		type: "slot",
    		source: "(33:1) <Button type=\\\"danger\\\" round>",
    		ctx
    	});

    	return block;
    }

    // (45:2) <Button disabled>
    function create_default_slot_28$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("默认按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_28$3.name,
    		type: "slot",
    		source: "(45:2) <Button disabled>",
    		ctx
    	});

    	return block;
    }

    // (46:2) <Button type="primary" disabled>
    function create_default_slot_27$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("主要按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_27$3.name,
    		type: "slot",
    		source: "(46:2) <Button type=\\\"primary\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (47:2) <Button type="success" disabled>
    function create_default_slot_26$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("成功按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_26$3.name,
    		type: "slot",
    		source: "(47:2) <Button type=\\\"success\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (48:2) <Button type="info" disabled>
    function create_default_slot_25$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("信息按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_25$3.name,
    		type: "slot",
    		source: "(48:2) <Button type=\\\"info\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (49:2) <Button type="warning" disabled>
    function create_default_slot_24$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("警告按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_24$3.name,
    		type: "slot",
    		source: "(49:2) <Button type=\\\"warning\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (50:2) <Button type="danger" disabled>
    function create_default_slot_23$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("危险按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_23$3.name,
    		type: "slot",
    		source: "(50:2) <Button type=\\\"danger\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (55:2) <Button plain disabled>
    function create_default_slot_22$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("朴素按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22$3.name,
    		type: "slot",
    		source: "(55:2) <Button plain disabled>",
    		ctx
    	});

    	return block;
    }

    // (56:2) <Button type="primary" plain disabled>
    function create_default_slot_21$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("主要按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21$3.name,
    		type: "slot",
    		source: "(56:2) <Button type=\\\"primary\\\" plain disabled>",
    		ctx
    	});

    	return block;
    }

    // (57:2) <Button type="success" plain disabled>
    function create_default_slot_20$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("成功按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20$3.name,
    		type: "slot",
    		source: "(57:2) <Button type=\\\"success\\\" plain disabled>",
    		ctx
    	});

    	return block;
    }

    // (58:2) <Button type="info" plain disabled>
    function create_default_slot_19$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("信息按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19$3.name,
    		type: "slot",
    		source: "(58:2) <Button type=\\\"info\\\" plain disabled>",
    		ctx
    	});

    	return block;
    }

    // (59:2) <Button type="warning" plain disabled>
    function create_default_slot_18$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("警告按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18$3.name,
    		type: "slot",
    		source: "(59:2) <Button type=\\\"warning\\\" plain disabled>",
    		ctx
    	});

    	return block;
    }

    // (60:2) <Button type="danger" plain disabled>
    function create_default_slot_17$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("危险按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17$3.name,
    		type: "slot",
    		source: "(60:2) <Button type=\\\"danger\\\" plain disabled>",
    		ctx
    	});

    	return block;
    }

    // (64:1) <Button type="text">
    function create_default_slot_16$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("文字按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16$3.name,
    		type: "slot",
    		source: "(64:1) <Button type=\\\"text\\\">",
    		ctx
    	});

    	return block;
    }

    // (65:1) <Button type="text" disabled>
    function create_default_slot_15$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("文字按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15$4.name,
    		type: "slot",
    		source: "(65:1) <Button type=\\\"text\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (71:1) <Button type="primary" icon="search">
    function create_default_slot_14$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("搜索");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14$4.name,
    		type: "slot",
    		source: "(71:1) <Button type=\\\"primary\\\" icon=\\\"search\\\">",
    		ctx
    	});

    	return block;
    }

    // (72:1) <Button type="primary">
    function create_default_slot_13$4(ctx) {
    	let t;
    	let i;

    	const block = {
    		c: function create() {
    			t = text("上传");
    			i = element("i");
    			attr_dev(i, "class", "upload -right");
    			add_location(i, file$5, 71, 26, 2176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13$4.name,
    		type: "slot",
    		source: "(72:1) <Button type=\\\"primary\\\">",
    		ctx
    	});

    	return block;
    }

    // (76:2) <Button type="primary" icon="arrow-left">
    function create_default_slot_12$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("上一页");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12$4.name,
    		type: "slot",
    		source: "(76:2) <Button type=\\\"primary\\\" icon=\\\"arrow-left\\\">",
    		ctx
    	});

    	return block;
    }

    // (77:2) <Button type="primary">
    function create_default_slot_11$4(ctx) {
    	let t;
    	let i;

    	const block = {
    		c: function create() {
    			t = text("下一页");
    			i = element("i");
    			attr_dev(i, "class", "arrow-right -right");
    			add_location(i, file$5, 76, 28, 2328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11$4.name,
    		type: "slot",
    		source: "(77:2) <Button type=\\\"primary\\\">",
    		ctx
    	});

    	return block;
    }

    // (75:1) <ButtonGroup>
    function create_default_slot_10$4(ctx) {
    	let button0;
    	let t;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				type: "primary",
    				icon: "arrow-left",
    				$$slots: { default: [create_default_slot_12$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				type: "primary",
    				$$slots: { default: [create_default_slot_11$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(button1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(button1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10$4.name,
    		type: "slot",
    		source: "(75:1) <ButtonGroup>",
    		ctx
    	});

    	return block;
    }

    // (79:1) <ButtonGroup>
    function create_default_slot_9$4(ctx) {
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let button2;
    	let current;

    	button0 = new Button({
    			props: { type: "primary", icon: "edit" },
    			$$inline: true
    		});

    	button1 = new Button({
    			props: { type: "primary", icon: "share" },
    			$$inline: true
    		});

    	button2 = new Button({
    			props: { type: "primary", icon: "delete" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			create_component(button2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(button2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9$4.name,
    		type: "slot",
    		source: "(79:1) <ButtonGroup>",
    		ctx
    	});

    	return block;
    }

    // (86:1) <Button type="primary" loading>
    function create_default_slot_8$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("加载中");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$4.name,
    		type: "slot",
    		source: "(86:1) <Button type=\\\"primary\\\" loading>",
    		ctx
    	});

    	return block;
    }

    // (90:2) <Button>
    function create_default_slot_7$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("默认按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$4.name,
    		type: "slot",
    		source: "(90:2) <Button>",
    		ctx
    	});

    	return block;
    }

    // (91:2) <Button size="medium">
    function create_default_slot_6$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("中等按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$4.name,
    		type: "slot",
    		source: "(91:2) <Button size=\\\"medium\\\">",
    		ctx
    	});

    	return block;
    }

    // (92:2) <Button size="small">
    function create_default_slot_5$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("小型按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$4.name,
    		type: "slot",
    		source: "(92:2) <Button size=\\\"small\\\">",
    		ctx
    	});

    	return block;
    }

    // (93:2) <Button size="mini">
    function create_default_slot_4$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("超小按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$4.name,
    		type: "slot",
    		source: "(93:2) <Button size=\\\"mini\\\">",
    		ctx
    	});

    	return block;
    }

    // (96:2) <Button round>
    function create_default_slot_3$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("默认按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(96:2) <Button round>",
    		ctx
    	});

    	return block;
    }

    // (97:2) <Button size="medium" round>
    function create_default_slot_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("中等按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(97:2) <Button size=\\\"medium\\\" round>",
    		ctx
    	});

    	return block;
    }

    // (98:2) <Button size="small" round>
    function create_default_slot_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("小型按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(98:2) <Button size=\\\"small\\\" round>",
    		ctx
    	});

    	return block;
    }

    // (99:2) <Button size="mini" round>
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("超小按钮");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(99:2) <Button size=\\\"mini\\\" round>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let br0;
    	let br1;
    	let t2;
    	let button2;
    	let t3;
    	let button3;
    	let t4;
    	let button4;
    	let t5;
    	let button5;
    	let t6;
    	let button6;
    	let t7;
    	let button7;
    	let t8;
    	let br2;
    	let t9;
    	let br3;
    	let t10;
    	let button8;
    	let t11;
    	let button9;
    	let t12;
    	let button10;
    	let t13;
    	let button11;
    	let t14;
    	let button12;
    	let t15;
    	let button13;
    	let t16;
    	let br4;
    	let t17;
    	let br5;
    	let t18;
    	let button14;
    	let t19;
    	let button15;
    	let t20;
    	let button16;
    	let t21;
    	let button17;
    	let t22;
    	let button18;
    	let t23;
    	let button19;
    	let t24;
    	let br6;
    	let t25;
    	let br7;
    	let t26;
    	let button20;
    	let t27;
    	let button21;
    	let t28;
    	let button22;
    	let t29;
    	let button23;
    	let t30;
    	let button24;
    	let t31;
    	let button25;
    	let t32;
    	let br8;
    	let t33;
    	let br9;
    	let t34;
    	let el_row0;
    	let button26;
    	let t35;
    	let button27;
    	let t36;
    	let button28;
    	let t37;
    	let button29;
    	let t38;
    	let button30;
    	let t39;
    	let button31;
    	let t40;
    	let br10;
    	let t41;
    	let br11;
    	let t42;
    	let el_row1;
    	let button32;
    	let t43;
    	let button33;
    	let t44;
    	let button34;
    	let t45;
    	let button35;
    	let t46;
    	let button36;
    	let t47;
    	let button37;
    	let t48;
    	let br12;
    	let t49;
    	let br13;
    	let t50;
    	let button38;
    	let t51;
    	let button39;
    	let t52;
    	let br14;
    	let t53;
    	let br15;
    	let t54;
    	let button40;
    	let t55;
    	let button41;
    	let t56;
    	let button42;
    	let t57;
    	let button43;
    	let t58;
    	let button44;
    	let t59;
    	let br16;
    	let t60;
    	let br17;
    	let t61;
    	let buttongroup0;
    	let t62;
    	let buttongroup1;
    	let t63;
    	let br18;
    	let t64;
    	let br19;
    	let t65;
    	let button45;
    	let t66;
    	let br20;
    	let t67;
    	let br21;
    	let t68;
    	let el_row2;
    	let button46;
    	let t69;
    	let button47;
    	let t70;
    	let button48;
    	let t71;
    	let button49;
    	let t72;
    	let el_row3;
    	let button50;
    	let t73;
    	let button51;
    	let t74;
    	let button52;
    	let t75;
    	let button53;
    	let t76;
    	let br22;
    	let t77;
    	let br23;
    	let current;
    	button0 = new Button({ $$inline: true });

    	button1 = new Button({
    			props: { type: "primary", text: "主要按钮" },
    			$$inline: true
    		});

    	button2 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_46$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", onclick);

    	button3 = new Button({
    			props: {
    				type: "primary",
    				$$slots: { default: [create_default_slot_45$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button4 = new Button({
    			props: {
    				type: "success",
    				$$slots: { default: [create_default_slot_44$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button5 = new Button({
    			props: {
    				type: "info",
    				$$slots: { default: [create_default_slot_43$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button6 = new Button({
    			props: {
    				type: "warning",
    				$$slots: { default: [create_default_slot_42$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button7 = new Button({
    			props: {
    				type: "danger",
    				$$slots: { default: [create_default_slot_41$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button8 = new Button({
    			props: {
    				plain: true,
    				$$slots: { default: [create_default_slot_40$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button9 = new Button({
    			props: {
    				type: "primary",
    				plain: true,
    				$$slots: { default: [create_default_slot_39$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button10 = new Button({
    			props: {
    				type: "success",
    				plain: true,
    				$$slots: { default: [create_default_slot_38$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button11 = new Button({
    			props: {
    				type: "info",
    				plain: true,
    				$$slots: { default: [create_default_slot_37$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button12 = new Button({
    			props: {
    				type: "warning",
    				plain: true,
    				$$slots: { default: [create_default_slot_36$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button13 = new Button({
    			props: {
    				type: "danger",
    				plain: true,
    				$$slots: { default: [create_default_slot_35$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button14 = new Button({
    			props: {
    				round: true,
    				$$slots: { default: [create_default_slot_34$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button15 = new Button({
    			props: {
    				type: "primary",
    				round: true,
    				$$slots: { default: [create_default_slot_33$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button16 = new Button({
    			props: {
    				type: "success",
    				round: true,
    				$$slots: { default: [create_default_slot_32$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button17 = new Button({
    			props: {
    				type: "info",
    				round: true,
    				$$slots: { default: [create_default_slot_31$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button18 = new Button({
    			props: {
    				type: "warning",
    				round: true,
    				$$slots: { default: [create_default_slot_30$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button19 = new Button({
    			props: {
    				type: "danger",
    				round: true,
    				$$slots: { default: [create_default_slot_29$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button20 = new Button({
    			props: { icon: "search", circle: true },
    			$$inline: true
    		});

    	button21 = new Button({
    			props: {
    				type: "primary",
    				icon: "edit",
    				circle: true
    			},
    			$$inline: true
    		});

    	button22 = new Button({
    			props: {
    				type: "success",
    				icon: "check",
    				circle: true
    			},
    			$$inline: true
    		});

    	button23 = new Button({
    			props: {
    				type: "info",
    				icon: "message",
    				circle: true
    			},
    			$$inline: true
    		});

    	button24 = new Button({
    			props: {
    				type: "warning",
    				icon: "star-off",
    				circle: true
    			},
    			$$inline: true
    		});

    	button25 = new Button({
    			props: {
    				type: "danger",
    				icon: "delete",
    				circle: true
    			},
    			$$inline: true
    		});

    	button26 = new Button({
    			props: {
    				disabled: true,
    				$$slots: { default: [create_default_slot_28$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button27 = new Button({
    			props: {
    				type: "primary",
    				disabled: true,
    				$$slots: { default: [create_default_slot_27$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button28 = new Button({
    			props: {
    				type: "success",
    				disabled: true,
    				$$slots: { default: [create_default_slot_26$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button29 = new Button({
    			props: {
    				type: "info",
    				disabled: true,
    				$$slots: { default: [create_default_slot_25$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button30 = new Button({
    			props: {
    				type: "warning",
    				disabled: true,
    				$$slots: { default: [create_default_slot_24$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button31 = new Button({
    			props: {
    				type: "danger",
    				disabled: true,
    				$$slots: { default: [create_default_slot_23$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button32 = new Button({
    			props: {
    				plain: true,
    				disabled: true,
    				$$slots: { default: [create_default_slot_22$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button33 = new Button({
    			props: {
    				type: "primary",
    				plain: true,
    				disabled: true,
    				$$slots: { default: [create_default_slot_21$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button34 = new Button({
    			props: {
    				type: "success",
    				plain: true,
    				disabled: true,
    				$$slots: { default: [create_default_slot_20$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button35 = new Button({
    			props: {
    				type: "info",
    				plain: true,
    				disabled: true,
    				$$slots: { default: [create_default_slot_19$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button36 = new Button({
    			props: {
    				type: "warning",
    				plain: true,
    				disabled: true,
    				$$slots: { default: [create_default_slot_18$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button37 = new Button({
    			props: {
    				type: "danger",
    				plain: true,
    				disabled: true,
    				$$slots: { default: [create_default_slot_17$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button38 = new Button({
    			props: {
    				type: "text",
    				$$slots: { default: [create_default_slot_16$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button39 = new Button({
    			props: {
    				type: "text",
    				disabled: true,
    				$$slots: { default: [create_default_slot_15$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button40 = new Button({
    			props: { type: "primary", icon: "edit" },
    			$$inline: true
    		});

    	button41 = new Button({
    			props: { type: "primary", icon: "share" },
    			$$inline: true
    		});

    	button42 = new Button({
    			props: { type: "primary", icon: "delete" },
    			$$inline: true
    		});

    	button43 = new Button({
    			props: {
    				type: "primary",
    				icon: "search",
    				$$slots: { default: [create_default_slot_14$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button44 = new Button({
    			props: {
    				type: "primary",
    				$$slots: { default: [create_default_slot_13$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	buttongroup0 = new ButtonGroup({
    			props: {
    				$$slots: { default: [create_default_slot_10$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	buttongroup1 = new ButtonGroup({
    			props: {
    				$$slots: { default: [create_default_slot_9$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button45 = new Button({
    			props: {
    				type: "primary",
    				loading: true,
    				$$slots: { default: [create_default_slot_8$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button46 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_7$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button47 = new Button({
    			props: {
    				size: "medium",
    				$$slots: { default: [create_default_slot_6$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button48 = new Button({
    			props: {
    				size: "small",
    				$$slots: { default: [create_default_slot_5$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button49 = new Button({
    			props: {
    				size: "mini",
    				$$slots: { default: [create_default_slot_4$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button50 = new Button({
    			props: {
    				round: true,
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button51 = new Button({
    			props: {
    				size: "medium",
    				round: true,
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button52 = new Button({
    			props: {
    				size: "small",
    				round: true,
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button53 = new Button({
    			props: {
    				size: "mini",
    				round: true,
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t2 = space();
    			create_component(button2.$$.fragment);
    			t3 = space();
    			create_component(button3.$$.fragment);
    			t4 = space();
    			create_component(button4.$$.fragment);
    			t5 = space();
    			create_component(button5.$$.fragment);
    			t6 = space();
    			create_component(button6.$$.fragment);
    			t7 = space();
    			create_component(button7.$$.fragment);
    			t8 = space();
    			br2 = element("br");
    			t9 = space();
    			br3 = element("br");
    			t10 = space();
    			create_component(button8.$$.fragment);
    			t11 = space();
    			create_component(button9.$$.fragment);
    			t12 = space();
    			create_component(button10.$$.fragment);
    			t13 = space();
    			create_component(button11.$$.fragment);
    			t14 = space();
    			create_component(button12.$$.fragment);
    			t15 = space();
    			create_component(button13.$$.fragment);
    			t16 = space();
    			br4 = element("br");
    			t17 = space();
    			br5 = element("br");
    			t18 = space();
    			create_component(button14.$$.fragment);
    			t19 = space();
    			create_component(button15.$$.fragment);
    			t20 = space();
    			create_component(button16.$$.fragment);
    			t21 = space();
    			create_component(button17.$$.fragment);
    			t22 = space();
    			create_component(button18.$$.fragment);
    			t23 = space();
    			create_component(button19.$$.fragment);
    			t24 = space();
    			br6 = element("br");
    			t25 = space();
    			br7 = element("br");
    			t26 = space();
    			create_component(button20.$$.fragment);
    			t27 = space();
    			create_component(button21.$$.fragment);
    			t28 = space();
    			create_component(button22.$$.fragment);
    			t29 = space();
    			create_component(button23.$$.fragment);
    			t30 = space();
    			create_component(button24.$$.fragment);
    			t31 = space();
    			create_component(button25.$$.fragment);
    			t32 = space();
    			br8 = element("br");
    			t33 = space();
    			br9 = element("br");
    			t34 = space();
    			el_row0 = element("el-row");
    			create_component(button26.$$.fragment);
    			t35 = space();
    			create_component(button27.$$.fragment);
    			t36 = space();
    			create_component(button28.$$.fragment);
    			t37 = space();
    			create_component(button29.$$.fragment);
    			t38 = space();
    			create_component(button30.$$.fragment);
    			t39 = space();
    			create_component(button31.$$.fragment);
    			t40 = space();
    			br10 = element("br");
    			t41 = space();
    			br11 = element("br");
    			t42 = space();
    			el_row1 = element("el-row");
    			create_component(button32.$$.fragment);
    			t43 = space();
    			create_component(button33.$$.fragment);
    			t44 = space();
    			create_component(button34.$$.fragment);
    			t45 = space();
    			create_component(button35.$$.fragment);
    			t46 = space();
    			create_component(button36.$$.fragment);
    			t47 = space();
    			create_component(button37.$$.fragment);
    			t48 = space();
    			br12 = element("br");
    			t49 = space();
    			br13 = element("br");
    			t50 = space();
    			create_component(button38.$$.fragment);
    			t51 = space();
    			create_component(button39.$$.fragment);
    			t52 = space();
    			br14 = element("br");
    			t53 = space();
    			br15 = element("br");
    			t54 = space();
    			create_component(button40.$$.fragment);
    			t55 = space();
    			create_component(button41.$$.fragment);
    			t56 = space();
    			create_component(button42.$$.fragment);
    			t57 = space();
    			create_component(button43.$$.fragment);
    			t58 = space();
    			create_component(button44.$$.fragment);
    			t59 = space();
    			br16 = element("br");
    			t60 = space();
    			br17 = element("br");
    			t61 = space();
    			create_component(buttongroup0.$$.fragment);
    			t62 = space();
    			create_component(buttongroup1.$$.fragment);
    			t63 = space();
    			br18 = element("br");
    			t64 = space();
    			br19 = element("br");
    			t65 = space();
    			create_component(button45.$$.fragment);
    			t66 = space();
    			br20 = element("br");
    			t67 = space();
    			br21 = element("br");
    			t68 = space();
    			el_row2 = element("el-row");
    			create_component(button46.$$.fragment);
    			t69 = space();
    			create_component(button47.$$.fragment);
    			t70 = space();
    			create_component(button48.$$.fragment);
    			t71 = space();
    			create_component(button49.$$.fragment);
    			t72 = space();
    			el_row3 = element("el-row");
    			create_component(button50.$$.fragment);
    			t73 = space();
    			create_component(button51.$$.fragment);
    			t74 = space();
    			create_component(button52.$$.fragment);
    			t75 = space();
    			create_component(button53.$$.fragment);
    			t76 = space();
    			br22 = element("br");
    			t77 = space();
    			br23 = element("br");
    			add_location(br0, file$5, 10, 1, 173);
    			add_location(br1, file$5, 10, 7, 179);
    			add_location(br2, file$5, 17, 1, 415);
    			add_location(br3, file$5, 18, 1, 423);
    			add_location(br4, file$5, 25, 1, 676);
    			add_location(br5, file$5, 26, 1, 684);
    			add_location(br6, file$5, 33, 1, 937);
    			add_location(br7, file$5, 34, 1, 945);
    			add_location(br8, file$5, 41, 1, 1222);
    			add_location(br9, file$5, 42, 1, 1230);
    			add_location(el_row0, file$5, 43, 1, 1238);
    			add_location(br10, file$5, 51, 1, 1528);
    			add_location(br11, file$5, 52, 1, 1536);
    			add_location(el_row1, file$5, 53, 1, 1544);
    			add_location(br12, file$5, 61, 1, 1870);
    			add_location(br13, file$5, 62, 1, 1878);
    			add_location(br14, file$5, 65, 1, 1965);
    			add_location(br15, file$5, 66, 1, 1973);
    			add_location(br16, file$5, 72, 1, 2214);
    			add_location(br17, file$5, 73, 1, 2222);
    			add_location(br18, file$5, 83, 1, 2541);
    			add_location(br19, file$5, 84, 1, 2549);
    			add_location(br20, file$5, 86, 1, 2602);
    			add_location(br21, file$5, 87, 1, 2610);
    			add_location(el_row2, file$5, 88, 1, 2618);
    			add_location(el_row3, file$5, 94, 1, 2774);
    			add_location(br22, file$5, 100, 1, 2954);
    			add_location(br23, file$5, 101, 1, 2962);
    			add_location(main, file$5, 7, 0, 112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(button0, main, null);
    			append_dev(main, t0);
    			mount_component(button1, main, null);
    			append_dev(main, t1);
    			append_dev(main, br0);
    			append_dev(main, br1);
    			append_dev(main, t2);
    			mount_component(button2, main, null);
    			append_dev(main, t3);
    			mount_component(button3, main, null);
    			append_dev(main, t4);
    			mount_component(button4, main, null);
    			append_dev(main, t5);
    			mount_component(button5, main, null);
    			append_dev(main, t6);
    			mount_component(button6, main, null);
    			append_dev(main, t7);
    			mount_component(button7, main, null);
    			append_dev(main, t8);
    			append_dev(main, br2);
    			append_dev(main, t9);
    			append_dev(main, br3);
    			append_dev(main, t10);
    			mount_component(button8, main, null);
    			append_dev(main, t11);
    			mount_component(button9, main, null);
    			append_dev(main, t12);
    			mount_component(button10, main, null);
    			append_dev(main, t13);
    			mount_component(button11, main, null);
    			append_dev(main, t14);
    			mount_component(button12, main, null);
    			append_dev(main, t15);
    			mount_component(button13, main, null);
    			append_dev(main, t16);
    			append_dev(main, br4);
    			append_dev(main, t17);
    			append_dev(main, br5);
    			append_dev(main, t18);
    			mount_component(button14, main, null);
    			append_dev(main, t19);
    			mount_component(button15, main, null);
    			append_dev(main, t20);
    			mount_component(button16, main, null);
    			append_dev(main, t21);
    			mount_component(button17, main, null);
    			append_dev(main, t22);
    			mount_component(button18, main, null);
    			append_dev(main, t23);
    			mount_component(button19, main, null);
    			append_dev(main, t24);
    			append_dev(main, br6);
    			append_dev(main, t25);
    			append_dev(main, br7);
    			append_dev(main, t26);
    			mount_component(button20, main, null);
    			append_dev(main, t27);
    			mount_component(button21, main, null);
    			append_dev(main, t28);
    			mount_component(button22, main, null);
    			append_dev(main, t29);
    			mount_component(button23, main, null);
    			append_dev(main, t30);
    			mount_component(button24, main, null);
    			append_dev(main, t31);
    			mount_component(button25, main, null);
    			append_dev(main, t32);
    			append_dev(main, br8);
    			append_dev(main, t33);
    			append_dev(main, br9);
    			append_dev(main, t34);
    			append_dev(main, el_row0);
    			mount_component(button26, el_row0, null);
    			append_dev(el_row0, t35);
    			mount_component(button27, el_row0, null);
    			append_dev(el_row0, t36);
    			mount_component(button28, el_row0, null);
    			append_dev(el_row0, t37);
    			mount_component(button29, el_row0, null);
    			append_dev(el_row0, t38);
    			mount_component(button30, el_row0, null);
    			append_dev(el_row0, t39);
    			mount_component(button31, el_row0, null);
    			append_dev(main, t40);
    			append_dev(main, br10);
    			append_dev(main, t41);
    			append_dev(main, br11);
    			append_dev(main, t42);
    			append_dev(main, el_row1);
    			mount_component(button32, el_row1, null);
    			append_dev(el_row1, t43);
    			mount_component(button33, el_row1, null);
    			append_dev(el_row1, t44);
    			mount_component(button34, el_row1, null);
    			append_dev(el_row1, t45);
    			mount_component(button35, el_row1, null);
    			append_dev(el_row1, t46);
    			mount_component(button36, el_row1, null);
    			append_dev(el_row1, t47);
    			mount_component(button37, el_row1, null);
    			append_dev(main, t48);
    			append_dev(main, br12);
    			append_dev(main, t49);
    			append_dev(main, br13);
    			append_dev(main, t50);
    			mount_component(button38, main, null);
    			append_dev(main, t51);
    			mount_component(button39, main, null);
    			append_dev(main, t52);
    			append_dev(main, br14);
    			append_dev(main, t53);
    			append_dev(main, br15);
    			append_dev(main, t54);
    			mount_component(button40, main, null);
    			append_dev(main, t55);
    			mount_component(button41, main, null);
    			append_dev(main, t56);
    			mount_component(button42, main, null);
    			append_dev(main, t57);
    			mount_component(button43, main, null);
    			append_dev(main, t58);
    			mount_component(button44, main, null);
    			append_dev(main, t59);
    			append_dev(main, br16);
    			append_dev(main, t60);
    			append_dev(main, br17);
    			append_dev(main, t61);
    			mount_component(buttongroup0, main, null);
    			append_dev(main, t62);
    			mount_component(buttongroup1, main, null);
    			append_dev(main, t63);
    			append_dev(main, br18);
    			append_dev(main, t64);
    			append_dev(main, br19);
    			append_dev(main, t65);
    			mount_component(button45, main, null);
    			append_dev(main, t66);
    			append_dev(main, br20);
    			append_dev(main, t67);
    			append_dev(main, br21);
    			append_dev(main, t68);
    			append_dev(main, el_row2);
    			mount_component(button46, el_row2, null);
    			append_dev(el_row2, t69);
    			mount_component(button47, el_row2, null);
    			append_dev(el_row2, t70);
    			mount_component(button48, el_row2, null);
    			append_dev(el_row2, t71);
    			mount_component(button49, el_row2, null);
    			append_dev(main, t72);
    			append_dev(main, el_row3);
    			mount_component(button50, el_row3, null);
    			append_dev(el_row3, t73);
    			mount_component(button51, el_row3, null);
    			append_dev(el_row3, t74);
    			mount_component(button52, el_row3, null);
    			append_dev(el_row3, t75);
    			mount_component(button53, el_row3, null);
    			append_dev(main, t76);
    			append_dev(main, br22);
    			append_dev(main, t77);
    			append_dev(main, br23);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const button3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button3_changes.$$scope = { dirty, ctx };
    			}

    			button3.$set(button3_changes);
    			const button4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button4_changes.$$scope = { dirty, ctx };
    			}

    			button4.$set(button4_changes);
    			const button5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button5_changes.$$scope = { dirty, ctx };
    			}

    			button5.$set(button5_changes);
    			const button6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button6_changes.$$scope = { dirty, ctx };
    			}

    			button6.$set(button6_changes);
    			const button7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button7_changes.$$scope = { dirty, ctx };
    			}

    			button7.$set(button7_changes);
    			const button8_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button8_changes.$$scope = { dirty, ctx };
    			}

    			button8.$set(button8_changes);
    			const button9_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button9_changes.$$scope = { dirty, ctx };
    			}

    			button9.$set(button9_changes);
    			const button10_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button10_changes.$$scope = { dirty, ctx };
    			}

    			button10.$set(button10_changes);
    			const button11_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button11_changes.$$scope = { dirty, ctx };
    			}

    			button11.$set(button11_changes);
    			const button12_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button12_changes.$$scope = { dirty, ctx };
    			}

    			button12.$set(button12_changes);
    			const button13_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button13_changes.$$scope = { dirty, ctx };
    			}

    			button13.$set(button13_changes);
    			const button14_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button14_changes.$$scope = { dirty, ctx };
    			}

    			button14.$set(button14_changes);
    			const button15_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button15_changes.$$scope = { dirty, ctx };
    			}

    			button15.$set(button15_changes);
    			const button16_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button16_changes.$$scope = { dirty, ctx };
    			}

    			button16.$set(button16_changes);
    			const button17_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button17_changes.$$scope = { dirty, ctx };
    			}

    			button17.$set(button17_changes);
    			const button18_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button18_changes.$$scope = { dirty, ctx };
    			}

    			button18.$set(button18_changes);
    			const button19_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button19_changes.$$scope = { dirty, ctx };
    			}

    			button19.$set(button19_changes);
    			const button26_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button26_changes.$$scope = { dirty, ctx };
    			}

    			button26.$set(button26_changes);
    			const button27_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button27_changes.$$scope = { dirty, ctx };
    			}

    			button27.$set(button27_changes);
    			const button28_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button28_changes.$$scope = { dirty, ctx };
    			}

    			button28.$set(button28_changes);
    			const button29_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button29_changes.$$scope = { dirty, ctx };
    			}

    			button29.$set(button29_changes);
    			const button30_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button30_changes.$$scope = { dirty, ctx };
    			}

    			button30.$set(button30_changes);
    			const button31_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button31_changes.$$scope = { dirty, ctx };
    			}

    			button31.$set(button31_changes);
    			const button32_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button32_changes.$$scope = { dirty, ctx };
    			}

    			button32.$set(button32_changes);
    			const button33_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button33_changes.$$scope = { dirty, ctx };
    			}

    			button33.$set(button33_changes);
    			const button34_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button34_changes.$$scope = { dirty, ctx };
    			}

    			button34.$set(button34_changes);
    			const button35_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button35_changes.$$scope = { dirty, ctx };
    			}

    			button35.$set(button35_changes);
    			const button36_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button36_changes.$$scope = { dirty, ctx };
    			}

    			button36.$set(button36_changes);
    			const button37_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button37_changes.$$scope = { dirty, ctx };
    			}

    			button37.$set(button37_changes);
    			const button38_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button38_changes.$$scope = { dirty, ctx };
    			}

    			button38.$set(button38_changes);
    			const button39_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button39_changes.$$scope = { dirty, ctx };
    			}

    			button39.$set(button39_changes);
    			const button43_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button43_changes.$$scope = { dirty, ctx };
    			}

    			button43.$set(button43_changes);
    			const button44_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button44_changes.$$scope = { dirty, ctx };
    			}

    			button44.$set(button44_changes);
    			const buttongroup0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				buttongroup0_changes.$$scope = { dirty, ctx };
    			}

    			buttongroup0.$set(buttongroup0_changes);
    			const buttongroup1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				buttongroup1_changes.$$scope = { dirty, ctx };
    			}

    			buttongroup1.$set(buttongroup1_changes);
    			const button45_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button45_changes.$$scope = { dirty, ctx };
    			}

    			button45.$set(button45_changes);
    			const button46_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button46_changes.$$scope = { dirty, ctx };
    			}

    			button46.$set(button46_changes);
    			const button47_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button47_changes.$$scope = { dirty, ctx };
    			}

    			button47.$set(button47_changes);
    			const button48_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button48_changes.$$scope = { dirty, ctx };
    			}

    			button48.$set(button48_changes);
    			const button49_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button49_changes.$$scope = { dirty, ctx };
    			}

    			button49.$set(button49_changes);
    			const button50_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button50_changes.$$scope = { dirty, ctx };
    			}

    			button50.$set(button50_changes);
    			const button51_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button51_changes.$$scope = { dirty, ctx };
    			}

    			button51.$set(button51_changes);
    			const button52_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button52_changes.$$scope = { dirty, ctx };
    			}

    			button52.$set(button52_changes);
    			const button53_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button53_changes.$$scope = { dirty, ctx };
    			}

    			button53.$set(button53_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			transition_in(button4.$$.fragment, local);
    			transition_in(button5.$$.fragment, local);
    			transition_in(button6.$$.fragment, local);
    			transition_in(button7.$$.fragment, local);
    			transition_in(button8.$$.fragment, local);
    			transition_in(button9.$$.fragment, local);
    			transition_in(button10.$$.fragment, local);
    			transition_in(button11.$$.fragment, local);
    			transition_in(button12.$$.fragment, local);
    			transition_in(button13.$$.fragment, local);
    			transition_in(button14.$$.fragment, local);
    			transition_in(button15.$$.fragment, local);
    			transition_in(button16.$$.fragment, local);
    			transition_in(button17.$$.fragment, local);
    			transition_in(button18.$$.fragment, local);
    			transition_in(button19.$$.fragment, local);
    			transition_in(button20.$$.fragment, local);
    			transition_in(button21.$$.fragment, local);
    			transition_in(button22.$$.fragment, local);
    			transition_in(button23.$$.fragment, local);
    			transition_in(button24.$$.fragment, local);
    			transition_in(button25.$$.fragment, local);
    			transition_in(button26.$$.fragment, local);
    			transition_in(button27.$$.fragment, local);
    			transition_in(button28.$$.fragment, local);
    			transition_in(button29.$$.fragment, local);
    			transition_in(button30.$$.fragment, local);
    			transition_in(button31.$$.fragment, local);
    			transition_in(button32.$$.fragment, local);
    			transition_in(button33.$$.fragment, local);
    			transition_in(button34.$$.fragment, local);
    			transition_in(button35.$$.fragment, local);
    			transition_in(button36.$$.fragment, local);
    			transition_in(button37.$$.fragment, local);
    			transition_in(button38.$$.fragment, local);
    			transition_in(button39.$$.fragment, local);
    			transition_in(button40.$$.fragment, local);
    			transition_in(button41.$$.fragment, local);
    			transition_in(button42.$$.fragment, local);
    			transition_in(button43.$$.fragment, local);
    			transition_in(button44.$$.fragment, local);
    			transition_in(buttongroup0.$$.fragment, local);
    			transition_in(buttongroup1.$$.fragment, local);
    			transition_in(button45.$$.fragment, local);
    			transition_in(button46.$$.fragment, local);
    			transition_in(button47.$$.fragment, local);
    			transition_in(button48.$$.fragment, local);
    			transition_in(button49.$$.fragment, local);
    			transition_in(button50.$$.fragment, local);
    			transition_in(button51.$$.fragment, local);
    			transition_in(button52.$$.fragment, local);
    			transition_in(button53.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			transition_out(button4.$$.fragment, local);
    			transition_out(button5.$$.fragment, local);
    			transition_out(button6.$$.fragment, local);
    			transition_out(button7.$$.fragment, local);
    			transition_out(button8.$$.fragment, local);
    			transition_out(button9.$$.fragment, local);
    			transition_out(button10.$$.fragment, local);
    			transition_out(button11.$$.fragment, local);
    			transition_out(button12.$$.fragment, local);
    			transition_out(button13.$$.fragment, local);
    			transition_out(button14.$$.fragment, local);
    			transition_out(button15.$$.fragment, local);
    			transition_out(button16.$$.fragment, local);
    			transition_out(button17.$$.fragment, local);
    			transition_out(button18.$$.fragment, local);
    			transition_out(button19.$$.fragment, local);
    			transition_out(button20.$$.fragment, local);
    			transition_out(button21.$$.fragment, local);
    			transition_out(button22.$$.fragment, local);
    			transition_out(button23.$$.fragment, local);
    			transition_out(button24.$$.fragment, local);
    			transition_out(button25.$$.fragment, local);
    			transition_out(button26.$$.fragment, local);
    			transition_out(button27.$$.fragment, local);
    			transition_out(button28.$$.fragment, local);
    			transition_out(button29.$$.fragment, local);
    			transition_out(button30.$$.fragment, local);
    			transition_out(button31.$$.fragment, local);
    			transition_out(button32.$$.fragment, local);
    			transition_out(button33.$$.fragment, local);
    			transition_out(button34.$$.fragment, local);
    			transition_out(button35.$$.fragment, local);
    			transition_out(button36.$$.fragment, local);
    			transition_out(button37.$$.fragment, local);
    			transition_out(button38.$$.fragment, local);
    			transition_out(button39.$$.fragment, local);
    			transition_out(button40.$$.fragment, local);
    			transition_out(button41.$$.fragment, local);
    			transition_out(button42.$$.fragment, local);
    			transition_out(button43.$$.fragment, local);
    			transition_out(button44.$$.fragment, local);
    			transition_out(buttongroup0.$$.fragment, local);
    			transition_out(buttongroup1.$$.fragment, local);
    			transition_out(button45.$$.fragment, local);
    			transition_out(button46.$$.fragment, local);
    			transition_out(button47.$$.fragment, local);
    			transition_out(button48.$$.fragment, local);
    			transition_out(button49.$$.fragment, local);
    			transition_out(button50.$$.fragment, local);
    			transition_out(button51.$$.fragment, local);
    			transition_out(button52.$$.fragment, local);
    			transition_out(button53.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(button3);
    			destroy_component(button4);
    			destroy_component(button5);
    			destroy_component(button6);
    			destroy_component(button7);
    			destroy_component(button8);
    			destroy_component(button9);
    			destroy_component(button10);
    			destroy_component(button11);
    			destroy_component(button12);
    			destroy_component(button13);
    			destroy_component(button14);
    			destroy_component(button15);
    			destroy_component(button16);
    			destroy_component(button17);
    			destroy_component(button18);
    			destroy_component(button19);
    			destroy_component(button20);
    			destroy_component(button21);
    			destroy_component(button22);
    			destroy_component(button23);
    			destroy_component(button24);
    			destroy_component(button25);
    			destroy_component(button26);
    			destroy_component(button27);
    			destroy_component(button28);
    			destroy_component(button29);
    			destroy_component(button30);
    			destroy_component(button31);
    			destroy_component(button32);
    			destroy_component(button33);
    			destroy_component(button34);
    			destroy_component(button35);
    			destroy_component(button36);
    			destroy_component(button37);
    			destroy_component(button38);
    			destroy_component(button39);
    			destroy_component(button40);
    			destroy_component(button41);
    			destroy_component(button42);
    			destroy_component(button43);
    			destroy_component(button44);
    			destroy_component(buttongroup0);
    			destroy_component(buttongroup1);
    			destroy_component(button45);
    			destroy_component(button46);
    			destroy_component(button47);
    			destroy_component(button48);
    			destroy_component(button49);
    			destroy_component(button50);
    			destroy_component(button51);
    			destroy_component(button52);
    			destroy_component(button53);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onclick(e) {
    	alert("按钮");
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Button, ButtonGroup, onclick });
    	return [];
    }

    class Button_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button_1",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\doc\Row.svelte generated by Svelte v3.46.4 */
    const file$4 = "src\\doc\\Row.svelte";

    // (7:1) <Col span="24" style="width:400px;">
    function create_default_slot_74(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-dark");
    			add_location(div, file$4, 6, 37, 182);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_74.name,
    		type: "slot",
    		source: "(7:1) <Col span=\\\"24\\\" style=\\\"width:400px;\\\">",
    		ctx
    	});

    	return block;
    }

    // (6:0) <Row style="width:400px;">
    function create_default_slot_73(ctx) {
    	let col;
    	let current;

    	col = new Col({
    			props: {
    				span: "24",
    				style: "width:400px;",
    				$$slots: { default: [create_default_slot_74] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_73.name,
    		type: "slot",
    		source: "(6:0) <Row style=\\\"width:400px;\\\">",
    		ctx
    	});

    	return block;
    }

    // (10:1) <Col span="12">
    function create_default_slot_72(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 9, 16, 261);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_72.name,
    		type: "slot",
    		source: "(10:1) <Col span=\\\"12\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:1) <Col span="12">
    function create_default_slot_71(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 10, 16, 322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_71.name,
    		type: "slot",
    		source: "(11:1) <Col span=\\\"12\\\">",
    		ctx
    	});

    	return block;
    }

    // (9:0) <Row>
    function create_default_slot_70(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "12",
    				$$slots: { default: [create_default_slot_72] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "12",
    				$$slots: { default: [create_default_slot_71] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_70.name,
    		type: "slot",
    		source: "(9:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (14:1) <Col span="8">
    function create_default_slot_69(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 13, 15, 401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_69.name,
    		type: "slot",
    		source: "(14:1) <Col span=\\\"8\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:1) <Col span="8">
    function create_default_slot_68(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 14, 15, 461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_68.name,
    		type: "slot",
    		source: "(15:1) <Col span=\\\"8\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:1) <Col span="8">
    function create_default_slot_67(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 15, 15, 527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_67.name,
    		type: "slot",
    		source: "(16:1) <Col span=\\\"8\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:0) <Row>
    function create_default_slot_66(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "8",
    				$$slots: { default: [create_default_slot_69] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "8",
    				$$slots: { default: [create_default_slot_68] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "8",
    				$$slots: { default: [create_default_slot_67] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_66.name,
    		type: "slot",
    		source: "(13:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (19:1) <Col span="6">
    function create_default_slot_65(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 18, 15, 600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_65.name,
    		type: "slot",
    		source: "(19:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:1) <Col span="6">
    function create_default_slot_64(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 19, 15, 660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_64.name,
    		type: "slot",
    		source: "(20:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:1) <Col span="6">
    function create_default_slot_63(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 20, 15, 726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_63.name,
    		type: "slot",
    		source: "(21:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:1) <Col span="6">
    function create_default_slot_62(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 21, 15, 786);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_62.name,
    		type: "slot",
    		source: "(22:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:0) <Row>
    function create_default_slot_61(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let t2;
    	let col3;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_65] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_64] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_63] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col3 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_62] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    			t2 = space();
    			create_component(col3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(col3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    			const col3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col3_changes.$$scope = { dirty, ctx };
    			}

    			col3.$set(col3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			transition_in(col3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			transition_out(col3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(col3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_61.name,
    		type: "slot",
    		source: "(18:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (25:1) <Col span="4">
    function create_default_slot_60(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 24, 15, 865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_60.name,
    		type: "slot",
    		source: "(25:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (26:1) <Col span="4">
    function create_default_slot_59(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 25, 15, 925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_59.name,
    		type: "slot",
    		source: "(26:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:1) <Col span="4">
    function create_default_slot_58(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 26, 15, 991);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_58.name,
    		type: "slot",
    		source: "(27:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:1) <Col span="4">
    function create_default_slot_57(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 27, 15, 1051);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_57.name,
    		type: "slot",
    		source: "(28:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (29:1) <Col span="4">
    function create_default_slot_56(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 28, 15, 1117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_56.name,
    		type: "slot",
    		source: "(29:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:1) <Col span="4">
    function create_default_slot_55(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 29, 15, 1177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_55.name,
    		type: "slot",
    		source: "(30:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Row>
    function create_default_slot_54(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let t2;
    	let col3;
    	let t3;
    	let col4;
    	let t4;
    	let col5;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_60] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_59] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_58] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col3 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_57] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col4 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_56] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col5 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_55] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    			t2 = space();
    			create_component(col3.$$.fragment);
    			t3 = space();
    			create_component(col4.$$.fragment);
    			t4 = space();
    			create_component(col5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(col3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(col4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(col5, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    			const col3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col3_changes.$$scope = { dirty, ctx };
    			}

    			col3.$set(col3_changes);
    			const col4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col4_changes.$$scope = { dirty, ctx };
    			}

    			col4.$set(col4_changes);
    			const col5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col5_changes.$$scope = { dirty, ctx };
    			}

    			col5.$set(col5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			transition_in(col3.$$.fragment, local);
    			transition_in(col4.$$.fragment, local);
    			transition_in(col5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			transition_out(col3.$$.fragment, local);
    			transition_out(col4.$$.fragment, local);
    			transition_out(col5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(col3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(col4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(col5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_54.name,
    		type: "slot",
    		source: "(24:0) <Row>",
    		ctx
    	});

    	return block;
    }

    // (37:1) <Col span="6">
    function create_default_slot_53(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 36, 15, 1288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_53.name,
    		type: "slot",
    		source: "(37:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (38:1) <Col span="6">
    function create_default_slot_52(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 37, 15, 1352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_52.name,
    		type: "slot",
    		source: "(38:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:1) <Col span="6">
    function create_default_slot_51(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 38, 15, 1416);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_51.name,
    		type: "slot",
    		source: "(39:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (40:1) <Col span="6">
    function create_default_slot_50(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 39, 15, 1480);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_50.name,
    		type: "slot",
    		source: "(40:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (36:0) <Row gutter="20">
    function create_default_slot_49(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let t2;
    	let col3;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_53] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_52] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_51] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col3 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_50] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    			t2 = space();
    			create_component(col3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(col3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    			const col3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col3_changes.$$scope = { dirty, ctx };
    			}

    			col3.$set(col3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			transition_in(col3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			transition_out(col3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(col3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_49.name,
    		type: "slot",
    		source: "(36:0) <Row gutter=\\\"20\\\">",
    		ctx
    	});

    	return block;
    }

    // (48:1) <Col span="16">
    function create_default_slot_48(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 47, 16, 1593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_48.name,
    		type: "slot",
    		source: "(48:1) <Col span=\\\"16\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:1) <Col span="8">
    function create_default_slot_47(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 48, 15, 1657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_47.name,
    		type: "slot",
    		source: "(49:1) <Col span=\\\"8\\\">",
    		ctx
    	});

    	return block;
    }

    // (47:0) <Row gutter="20">
    function create_default_slot_46$1(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "16",
    				$$slots: { default: [create_default_slot_48] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "8",
    				$$slots: { default: [create_default_slot_47] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_46$1.name,
    		type: "slot",
    		source: "(47:0) <Row gutter=\\\"20\\\">",
    		ctx
    	});

    	return block;
    }

    // (52:1) <Col span="8">
    function create_default_slot_45$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 51, 15, 1750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_45$1.name,
    		type: "slot",
    		source: "(52:1) <Col span=\\\"8\\\">",
    		ctx
    	});

    	return block;
    }

    // (53:1) <Col span="8">
    function create_default_slot_44$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 52, 15, 1814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_44$1.name,
    		type: "slot",
    		source: "(53:1) <Col span=\\\"8\\\">",
    		ctx
    	});

    	return block;
    }

    // (54:1) <Col span="4">
    function create_default_slot_43$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 53, 15, 1878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_43$1.name,
    		type: "slot",
    		source: "(54:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (55:1) <Col span="4">
    function create_default_slot_42$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 54, 15, 1942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_42$1.name,
    		type: "slot",
    		source: "(55:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (51:2) <Row gutter="20">
    function create_default_slot_41$1(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let t2;
    	let col3;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "8",
    				$$slots: { default: [create_default_slot_45$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "8",
    				$$slots: { default: [create_default_slot_44$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_43$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col3 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_42$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    			t2 = space();
    			create_component(col3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(col3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    			const col3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col3_changes.$$scope = { dirty, ctx };
    			}

    			col3.$set(col3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			transition_in(col3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			transition_out(col3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(col3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_41$1.name,
    		type: "slot",
    		source: "(51:2) <Row gutter=\\\"20\\\">",
    		ctx
    	});

    	return block;
    }

    // (58:1) <Col span="4">
    function create_default_slot_40$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 57, 15, 2035);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_40$1.name,
    		type: "slot",
    		source: "(58:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (59:1) <Col span="16">
    function create_default_slot_39$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 58, 16, 2100);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_39$1.name,
    		type: "slot",
    		source: "(59:1) <Col span=\\\"16\\\">",
    		ctx
    	});

    	return block;
    }

    // (60:1) <Col span="4">
    function create_default_slot_38$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 59, 15, 2164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_38$1.name,
    		type: "slot",
    		source: "(60:1) <Col span=\\\"4\\\">",
    		ctx
    	});

    	return block;
    }

    // (57:2) <Row gutter="20">
    function create_default_slot_37$1(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_40$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "16",
    				$$slots: { default: [create_default_slot_39$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "4",
    				$$slots: { default: [create_default_slot_38$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_37$1.name,
    		type: "slot",
    		source: "(57:2) <Row gutter=\\\"20\\\">",
    		ctx
    	});

    	return block;
    }

    // (67:1) <Col span="6" style="width:100px;">
    function create_default_slot_36$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 66, 36, 2296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_36$1.name,
    		type: "slot",
    		source: "(67:1) <Col span=\\\"6\\\" style=\\\"width:100px;\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:1) <Col span="6" offset="6">
    function create_default_slot_35$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 67, 26, 2371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_35$1.name,
    		type: "slot",
    		source: "(68:1) <Col span=\\\"6\\\" offset=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (66:0) <Row gutter="20">
    function create_default_slot_34$1(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				style: "width:100px;",
    				$$slots: { default: [create_default_slot_36$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				offset: "6",
    				$$slots: { default: [create_default_slot_35$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_34$1.name,
    		type: "slot",
    		source: "(66:0) <Row gutter=\\\"20\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:1) <Col span="6" offset="6">
    function create_default_slot_33$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 70, 26, 2475);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_33$1.name,
    		type: "slot",
    		source: "(71:1) <Col span=\\\"6\\\" offset=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (72:1) <Col span="6" offset="6">
    function create_default_slot_32$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 71, 26, 2550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_32$2.name,
    		type: "slot",
    		source: "(72:1) <Col span=\\\"6\\\" offset=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (70:2) <Row gutter="20">
    function create_default_slot_31$2(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				offset: "6",
    				$$slots: { default: [create_default_slot_33$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				offset: "6",
    				$$slots: { default: [create_default_slot_32$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_31$2.name,
    		type: "slot",
    		source: "(70:2) <Row gutter=\\\"20\\\">",
    		ctx
    	});

    	return block;
    }

    // (75:1) <Col span="12" offset="6">
    function create_default_slot_30$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 74, 27, 2655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_30$2.name,
    		type: "slot",
    		source: "(75:1) <Col span=\\\"12\\\" offset=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (74:2) <Row gutter="20">
    function create_default_slot_29$2(ctx) {
    	let col;
    	let current;

    	col = new Col({
    			props: {
    				span: "12",
    				offset: "6",
    				$$slots: { default: [create_default_slot_30$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_29$2.name,
    		type: "slot",
    		source: "(74:2) <Row gutter=\\\"20\\\">",
    		ctx
    	});

    	return block;
    }

    // (82:1) <Col span="6">
    function create_default_slot_28$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 81, 15, 2781);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_28$2.name,
    		type: "slot",
    		source: "(82:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (83:1) <Col span="6">
    function create_default_slot_27$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 82, 15, 2845);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_27$2.name,
    		type: "slot",
    		source: "(83:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (84:1) <Col span="6">
    function create_default_slot_26$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 83, 15, 2915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_26$2.name,
    		type: "slot",
    		source: "(84:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (81:0) <Row type="flex" class="row-bg">
    function create_default_slot_25$2(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_28$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_27$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_26$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_25$2.name,
    		type: "slot",
    		source: "(81:0) <Row type=\\\"flex\\\" class=\\\"row-bg\\\">",
    		ctx
    	});

    	return block;
    }

    // (87:1) <Col span="6">
    function create_default_slot_24$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 86, 15, 3040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_24$2.name,
    		type: "slot",
    		source: "(87:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (88:1) <Col span="6">
    function create_default_slot_23$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 87, 15, 3104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_23$2.name,
    		type: "slot",
    		source: "(88:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (89:1) <Col span="6">
    function create_default_slot_22$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 88, 15, 3174);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22$2.name,
    		type: "slot",
    		source: "(89:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (86:2) <Row type="flex" class="row-bg" justify="center">
    function create_default_slot_21$2(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_24$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_23$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_22$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21$2.name,
    		type: "slot",
    		source: "(86:2) <Row type=\\\"flex\\\" class=\\\"row-bg\\\" justify=\\\"center\\\">",
    		ctx
    	});

    	return block;
    }

    // (92:1) <Col span="6">
    function create_default_slot_20$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 91, 15, 3296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20$2.name,
    		type: "slot",
    		source: "(92:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (93:1) <Col span="6">
    function create_default_slot_19$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 92, 15, 3360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19$2.name,
    		type: "slot",
    		source: "(93:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (94:1) <Col span="6">
    function create_default_slot_18$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 93, 15, 3430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18$2.name,
    		type: "slot",
    		source: "(94:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (91:2) <Row type="flex" class="row-bg" justify="end">
    function create_default_slot_17$2(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_20$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_19$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_18$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17$2.name,
    		type: "slot",
    		source: "(91:2) <Row type=\\\"flex\\\" class=\\\"row-bg\\\" justify=\\\"end\\\">",
    		ctx
    	});

    	return block;
    }

    // (97:1) <Col span="6">
    function create_default_slot_16$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 96, 15, 3562);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16$2.name,
    		type: "slot",
    		source: "(97:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (98:1) <Col span="6">
    function create_default_slot_15$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 97, 15, 3626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15$3.name,
    		type: "slot",
    		source: "(98:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (99:1) <Col span="6">
    function create_default_slot_14$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 98, 15, 3696);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14$3.name,
    		type: "slot",
    		source: "(99:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (96:2) <Row type="flex" class="row-bg" justify="space-between">
    function create_default_slot_13$3(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_16$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_15$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_14$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13$3.name,
    		type: "slot",
    		source: "(96:2) <Row type=\\\"flex\\\" class=\\\"row-bg\\\" justify=\\\"space-between\\\">",
    		ctx
    	});

    	return block;
    }

    // (102:1) <Col span="6">
    function create_default_slot_12$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 101, 15, 3827);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12$3.name,
    		type: "slot",
    		source: "(102:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (103:1) <Col span="6">
    function create_default_slot_11$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 102, 15, 3891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11$3.name,
    		type: "slot",
    		source: "(103:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (104:1) <Col span="6">
    function create_default_slot_10$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 103, 15, 3961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10$3.name,
    		type: "slot",
    		source: "(104:1) <Col span=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (101:2) <Row type="flex" class="row-bg" justify="space-around">
    function create_default_slot_9$3(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_12$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_11$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				span: "6",
    				$$slots: { default: [create_default_slot_10$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9$3.name,
    		type: "slot",
    		source: "(101:2) <Row type=\\\"flex\\\" class=\\\"row-bg\\\" justify=\\\"space-around\\\">",
    		ctx
    	});

    	return block;
    }

    // (110:1) <Col xs="8" sm="6" md="4" lg="3" xl="1">
    function create_default_slot_8$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 109, 41, 4094);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$3.name,
    		type: "slot",
    		source: "(110:1) <Col xs=\\\"8\\\" sm=\\\"6\\\" md=\\\"4\\\" lg=\\\"3\\\" xl=\\\"1\\\">",
    		ctx
    	});

    	return block;
    }

    // (111:1) <Col xs="4" sm="6" md="8" lg="9" xl="11">
    function create_default_slot_7$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 110, 42, 4185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$3.name,
    		type: "slot",
    		source: "(111:1) <Col xs=\\\"4\\\" sm=\\\"6\\\" md=\\\"8\\\" lg=\\\"9\\\" xl=\\\"11\\\">",
    		ctx
    	});

    	return block;
    }

    // (112:1) <Col xs="4" sm="6" md="8" lg="9" xl="11">
    function create_default_slot_6$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 111, 42, 4282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$3.name,
    		type: "slot",
    		source: "(112:1) <Col xs=\\\"4\\\" sm=\\\"6\\\" md=\\\"8\\\" lg=\\\"9\\\" xl=\\\"11\\\">",
    		ctx
    	});

    	return block;
    }

    // (113:1) <Col xs="8" sm="6" md="4" lg="3" xl="1">
    function create_default_slot_5$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 112, 41, 4372);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$3.name,
    		type: "slot",
    		source: "(113:1) <Col xs=\\\"8\\\" sm=\\\"6\\\" md=\\\"4\\\" lg=\\\"3\\\" xl=\\\"1\\\">",
    		ctx
    	});

    	return block;
    }

    // (109:0) <Row gutter="10">
    function create_default_slot_4$3(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let t2;
    	let col3;
    	let current;

    	col0 = new Col({
    			props: {
    				xs: "8",
    				sm: "6",
    				md: "4",
    				lg: "3",
    				xl: "1",
    				$$slots: { default: [create_default_slot_8$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				xs: "4",
    				sm: "6",
    				md: "8",
    				lg: "9",
    				xl: "11",
    				$$slots: { default: [create_default_slot_7$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				xs: "4",
    				sm: "6",
    				md: "8",
    				lg: "9",
    				xl: "11",
    				$$slots: { default: [create_default_slot_6$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col3 = new Col({
    			props: {
    				xs: "8",
    				sm: "6",
    				md: "4",
    				lg: "3",
    				xl: "1",
    				$$slots: { default: [create_default_slot_5$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    			t2 = space();
    			create_component(col3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(col3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    			const col3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col3_changes.$$scope = { dirty, ctx };
    			}

    			col3.$set(col3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			transition_in(col3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			transition_out(col3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(col3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(109:0) <Row gutter=\\\"10\\\">",
    		ctx
    	});

    	return block;
    }

    // (119:1) <Col xs={{span:6,offset:6}} >
    function create_default_slot_3$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 118, 30, 4499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(119:1) <Col xs={{span:6,offset:6}} >",
    		ctx
    	});

    	return block;
    }

    // (120:1) <Col sm={{span:6,offset:6}} >
    function create_default_slot_2$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple");
    			add_location(div, file$4, 119, 30, 4578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(120:1) <Col sm={{span:6,offset:6}} >",
    		ctx
    	});

    	return block;
    }

    // (121:1) <Col xs="8" sm="6" md="4" lg="3" xl="1">
    function create_default_slot_1$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-content bg-purple-light");
    			add_location(div, file$4, 120, 41, 4668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(121:1) <Col xs=\\\"8\\\" sm=\\\"6\\\" md=\\\"4\\\" lg=\\\"3\\\" xl=\\\"1\\\">",
    		ctx
    	});

    	return block;
    }

    // (118:0) <Row gutter="10">
    function create_default_slot$4(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				xs: { span: 6, offset: 6 },
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				sm: { span: 6, offset: 6 },
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				xs: "8",
    				sm: "6",
    				md: "4",
    				lg: "3",
    				xl: "1",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(118:0) <Row gutter=\\\"10\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t0;
    	let row0;
    	let t1;
    	let row1;
    	let t2;
    	let row2;
    	let t3;
    	let row3;
    	let t4;
    	let row4;
    	let t5;
    	let br0;
    	let t6;
    	let br1;
    	let t7;
    	let br2;
    	let t8;
    	let row5;
    	let t9;
    	let br3;
    	let t10;
    	let br4;
    	let t11;
    	let br5;
    	let t12;
    	let row6;
    	let t13;
    	let row7;
    	let t14;
    	let row8;
    	let t15;
    	let br6;
    	let t16;
    	let br7;
    	let t17;
    	let br8;
    	let t18;
    	let row9;
    	let t19;
    	let row10;
    	let t20;
    	let row11;
    	let t21;
    	let br9;
    	let t22;
    	let br10;
    	let t23;
    	let br11;
    	let t24;
    	let row12;
    	let t25;
    	let row13;
    	let t26;
    	let row14;
    	let t27;
    	let row15;
    	let t28;
    	let row16;
    	let t29;
    	let br12;
    	let t30;
    	let br13;
    	let t31;
    	let row17;
    	let t32;
    	let br14;
    	let t33;
    	let br15;
    	let t34;
    	let row18;
    	let t35;
    	let br16;
    	let t36;
    	let br17;
    	let t37;
    	let br18;
    	let t38;
    	let br19;
    	let t39;
    	let br20;
    	let t40;
    	let br21;
    	let t41;
    	let br22;
    	let t42;
    	let br23;
    	let current;

    	row0 = new Row({
    			props: {
    				style: "width:400px;",
    				$$slots: { default: [create_default_slot_73] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row1 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_70] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row2 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_66] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row3 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_61] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row4 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_54] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row5 = new Row({
    			props: {
    				gutter: "20",
    				$$slots: { default: [create_default_slot_49] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row6 = new Row({
    			props: {
    				gutter: "20",
    				$$slots: { default: [create_default_slot_46$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row7 = new Row({
    			props: {
    				gutter: "20",
    				$$slots: { default: [create_default_slot_41$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row8 = new Row({
    			props: {
    				gutter: "20",
    				$$slots: { default: [create_default_slot_37$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row9 = new Row({
    			props: {
    				gutter: "20",
    				$$slots: { default: [create_default_slot_34$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row10 = new Row({
    			props: {
    				gutter: "20",
    				$$slots: { default: [create_default_slot_31$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row11 = new Row({
    			props: {
    				gutter: "20",
    				$$slots: { default: [create_default_slot_29$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row12 = new Row({
    			props: {
    				type: "flex",
    				class: "row-bg",
    				$$slots: { default: [create_default_slot_25$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row13 = new Row({
    			props: {
    				type: "flex",
    				class: "row-bg",
    				justify: "center",
    				$$slots: { default: [create_default_slot_21$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row14 = new Row({
    			props: {
    				type: "flex",
    				class: "row-bg",
    				justify: "end",
    				$$slots: { default: [create_default_slot_17$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row15 = new Row({
    			props: {
    				type: "flex",
    				class: "row-bg",
    				justify: "space-between",
    				$$slots: { default: [create_default_slot_13$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row16 = new Row({
    			props: {
    				type: "flex",
    				class: "row-bg",
    				justify: "space-around",
    				$$slots: { default: [create_default_slot_9$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row17 = new Row({
    			props: {
    				gutter: "10",
    				$$slots: { default: [create_default_slot_4$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row18 = new Row({
    			props: {
    				gutter: "10",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = text("基础布局\n");
    			create_component(row0.$$.fragment);
    			t1 = space();
    			create_component(row1.$$.fragment);
    			t2 = space();
    			create_component(row2.$$.fragment);
    			t3 = space();
    			create_component(row3.$$.fragment);
    			t4 = space();
    			create_component(row4.$$.fragment);
    			t5 = space();
    			br0 = element("br");
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			br2 = element("br");
    			t8 = text("\n分栏间隔\n");
    			create_component(row5.$$.fragment);
    			t9 = space();
    			br3 = element("br");
    			t10 = space();
    			br4 = element("br");
    			t11 = space();
    			br5 = element("br");
    			t12 = text("\n混合布局\n");
    			create_component(row6.$$.fragment);
    			t13 = space();
    			create_component(row7.$$.fragment);
    			t14 = space();
    			create_component(row8.$$.fragment);
    			t15 = space();
    			br6 = element("br");
    			t16 = space();
    			br7 = element("br");
    			t17 = space();
    			br8 = element("br");
    			t18 = text("\n分栏偏移\n");
    			create_component(row9.$$.fragment);
    			t19 = space();
    			create_component(row10.$$.fragment);
    			t20 = space();
    			create_component(row11.$$.fragment);
    			t21 = space();
    			br9 = element("br");
    			t22 = space();
    			br10 = element("br");
    			t23 = space();
    			br11 = element("br");
    			t24 = text("\n对齐方式\n");
    			create_component(row12.$$.fragment);
    			t25 = space();
    			create_component(row13.$$.fragment);
    			t26 = space();
    			create_component(row14.$$.fragment);
    			t27 = space();
    			create_component(row15.$$.fragment);
    			t28 = space();
    			create_component(row16.$$.fragment);
    			t29 = space();
    			br12 = element("br");
    			t30 = space();
    			br13 = element("br");
    			t31 = text("\n响应式布局\n");
    			create_component(row17.$$.fragment);
    			t32 = space();
    			br14 = element("br");
    			t33 = space();
    			br15 = element("br");
    			t34 = text("\ntest\n");
    			create_component(row18.$$.fragment);
    			t35 = space();
    			br16 = element("br");
    			t36 = space();
    			br17 = element("br");
    			t37 = space();
    			br18 = element("br");
    			t38 = space();
    			br19 = element("br");
    			t39 = space();
    			br20 = element("br");
    			t40 = space();
    			br21 = element("br");
    			t41 = space();
    			br22 = element("br");
    			t42 = space();
    			br23 = element("br");
    			add_location(br0, file$4, 31, 0, 1235);
    			add_location(br1, file$4, 32, 0, 1240);
    			add_location(br2, file$4, 33, 0, 1245);
    			add_location(br3, file$4, 42, 0, 1539);
    			add_location(br4, file$4, 43, 0, 1544);
    			add_location(br5, file$4, 44, 0, 1549);
    			add_location(br6, file$4, 61, 0, 2222);
    			add_location(br7, file$4, 62, 0, 2227);
    			add_location(br8, file$4, 63, 0, 2232);
    			add_location(br9, file$4, 76, 0, 2713);
    			add_location(br10, file$4, 77, 0, 2718);
    			add_location(br11, file$4, 78, 0, 2723);
    			add_location(br12, file$4, 105, 0, 4019);
    			add_location(br13, file$4, 106, 0, 4024);
    			add_location(br14, file$4, 114, 0, 4436);
    			add_location(br15, file$4, 115, 0, 4441);
    			add_location(br16, file$4, 122, 0, 4732);
    			add_location(br17, file$4, 123, 0, 4737);
    			add_location(br18, file$4, 125, 0, 4743);
    			add_location(br19, file$4, 126, 0, 4748);
    			add_location(br20, file$4, 128, 0, 4754);
    			add_location(br21, file$4, 129, 0, 4759);
    			add_location(br22, file$4, 131, 0, 4765);
    			add_location(br23, file$4, 132, 0, 4770);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(row0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(row2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(row3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(row4, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(row5, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(row6, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(row7, target, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(row8, target, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t18, anchor);
    			mount_component(row9, target, anchor);
    			insert_dev(target, t19, anchor);
    			mount_component(row10, target, anchor);
    			insert_dev(target, t20, anchor);
    			mount_component(row11, target, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, br9, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, br10, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, t24, anchor);
    			mount_component(row12, target, anchor);
    			insert_dev(target, t25, anchor);
    			mount_component(row13, target, anchor);
    			insert_dev(target, t26, anchor);
    			mount_component(row14, target, anchor);
    			insert_dev(target, t27, anchor);
    			mount_component(row15, target, anchor);
    			insert_dev(target, t28, anchor);
    			mount_component(row16, target, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, br12, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, br13, anchor);
    			insert_dev(target, t31, anchor);
    			mount_component(row17, target, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, br14, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, br15, anchor);
    			insert_dev(target, t34, anchor);
    			mount_component(row18, target, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, br16, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, br17, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, br18, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, br19, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, br20, anchor);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, br21, anchor);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, br22, anchor);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, br23, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const row0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    			const row2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row2_changes.$$scope = { dirty, ctx };
    			}

    			row2.$set(row2_changes);
    			const row3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row3_changes.$$scope = { dirty, ctx };
    			}

    			row3.$set(row3_changes);
    			const row4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row4_changes.$$scope = { dirty, ctx };
    			}

    			row4.$set(row4_changes);
    			const row5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row5_changes.$$scope = { dirty, ctx };
    			}

    			row5.$set(row5_changes);
    			const row6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row6_changes.$$scope = { dirty, ctx };
    			}

    			row6.$set(row6_changes);
    			const row7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row7_changes.$$scope = { dirty, ctx };
    			}

    			row7.$set(row7_changes);
    			const row8_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row8_changes.$$scope = { dirty, ctx };
    			}

    			row8.$set(row8_changes);
    			const row9_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row9_changes.$$scope = { dirty, ctx };
    			}

    			row9.$set(row9_changes);
    			const row10_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row10_changes.$$scope = { dirty, ctx };
    			}

    			row10.$set(row10_changes);
    			const row11_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row11_changes.$$scope = { dirty, ctx };
    			}

    			row11.$set(row11_changes);
    			const row12_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row12_changes.$$scope = { dirty, ctx };
    			}

    			row12.$set(row12_changes);
    			const row13_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row13_changes.$$scope = { dirty, ctx };
    			}

    			row13.$set(row13_changes);
    			const row14_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row14_changes.$$scope = { dirty, ctx };
    			}

    			row14.$set(row14_changes);
    			const row15_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row15_changes.$$scope = { dirty, ctx };
    			}

    			row15.$set(row15_changes);
    			const row16_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row16_changes.$$scope = { dirty, ctx };
    			}

    			row16.$set(row16_changes);
    			const row17_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row17_changes.$$scope = { dirty, ctx };
    			}

    			row17.$set(row17_changes);
    			const row18_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				row18_changes.$$scope = { dirty, ctx };
    			}

    			row18.$set(row18_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(row2.$$.fragment, local);
    			transition_in(row3.$$.fragment, local);
    			transition_in(row4.$$.fragment, local);
    			transition_in(row5.$$.fragment, local);
    			transition_in(row6.$$.fragment, local);
    			transition_in(row7.$$.fragment, local);
    			transition_in(row8.$$.fragment, local);
    			transition_in(row9.$$.fragment, local);
    			transition_in(row10.$$.fragment, local);
    			transition_in(row11.$$.fragment, local);
    			transition_in(row12.$$.fragment, local);
    			transition_in(row13.$$.fragment, local);
    			transition_in(row14.$$.fragment, local);
    			transition_in(row15.$$.fragment, local);
    			transition_in(row16.$$.fragment, local);
    			transition_in(row17.$$.fragment, local);
    			transition_in(row18.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(row2.$$.fragment, local);
    			transition_out(row3.$$.fragment, local);
    			transition_out(row4.$$.fragment, local);
    			transition_out(row5.$$.fragment, local);
    			transition_out(row6.$$.fragment, local);
    			transition_out(row7.$$.fragment, local);
    			transition_out(row8.$$.fragment, local);
    			transition_out(row9.$$.fragment, local);
    			transition_out(row10.$$.fragment, local);
    			transition_out(row11.$$.fragment, local);
    			transition_out(row12.$$.fragment, local);
    			transition_out(row13.$$.fragment, local);
    			transition_out(row14.$$.fragment, local);
    			transition_out(row15.$$.fragment, local);
    			transition_out(row16.$$.fragment, local);
    			transition_out(row17.$$.fragment, local);
    			transition_out(row18.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(row1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(row2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(row3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(row4, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t8);
    			destroy_component(row5, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t12);
    			destroy_component(row6, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(row7, detaching);
    			if (detaching) detach_dev(t14);
    			destroy_component(row8, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t18);
    			destroy_component(row9, detaching);
    			if (detaching) detach_dev(t19);
    			destroy_component(row10, detaching);
    			if (detaching) detach_dev(t20);
    			destroy_component(row11, detaching);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(br10);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t24);
    			destroy_component(row12, detaching);
    			if (detaching) detach_dev(t25);
    			destroy_component(row13, detaching);
    			if (detaching) detach_dev(t26);
    			destroy_component(row14, detaching);
    			if (detaching) detach_dev(t27);
    			destroy_component(row15, detaching);
    			if (detaching) detach_dev(t28);
    			destroy_component(row16, detaching);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(br12);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(br13);
    			if (detaching) detach_dev(t31);
    			destroy_component(row17, detaching);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(br14);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(br15);
    			if (detaching) detach_dev(t34);
    			destroy_component(row18, detaching);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(br16);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(br17);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(br18);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(br19);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(br20);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(br21);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(br22);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(br23);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Row, Col });
    	return [];
    }

    class Row_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row_1",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\doc\Container.svelte generated by Svelte v3.46.4 */

    // (12:2) <Header style="width:400px">
    function create_default_slot_32$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Header");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_32$1.name,
    		type: "slot",
    		source: "(12:2) <Header style=\\\"width:400px\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:2) <Main>
    function create_default_slot_31$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_31$1.name,
    		type: "slot",
    		source: "(13:2) <Main>",
    		ctx
    	});

    	return block;
    }

    // (11:0) <Container>
    function create_default_slot_30$1(ctx) {
    	let header;
    	let t;
    	let main;
    	let current;

    	header = new Header({
    			props: {
    				style: "width:400px",
    				$$slots: { default: [create_default_slot_32$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot_31$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(main.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const main_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_30$1.name,
    		type: "slot",
    		source: "(11:0) <Container>",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Header>
    function create_default_slot_29$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Header");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_29$1.name,
    		type: "slot",
    		source: "(17:2) <Header>",
    		ctx
    	});

    	return block;
    }

    // (18:2) <Main>
    function create_default_slot_28$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_28$1.name,
    		type: "slot",
    		source: "(18:2) <Main>",
    		ctx
    	});

    	return block;
    }

    // (19:2) <Footer>
    function create_default_slot_27$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Footer");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_27$1.name,
    		type: "slot",
    		source: "(19:2) <Footer>",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Container>
    function create_default_slot_26$1(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				$$slots: { default: [create_default_slot_29$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot_28$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({
    			props: {
    				$$slots: { default: [create_default_slot_27$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(main.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(main, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const main_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    			const footer_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				footer_changes.$$scope = { dirty, ctx };
    			}

    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_26$1.name,
    		type: "slot",
    		source: "(16:0) <Container>",
    		ctx
    	});

    	return block;
    }

    // (23:2) <Aside width="200px">
    function create_default_slot_25$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Aside");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_25$1.name,
    		type: "slot",
    		source: "(23:2) <Aside width=\\\"200px\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:2) <Main>
    function create_default_slot_24$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_24$1.name,
    		type: "slot",
    		source: "(24:2) <Main>",
    		ctx
    	});

    	return block;
    }

    // (22:0) <Container>
    function create_default_slot_23$1(ctx) {
    	let aside;
    	let t;
    	let main;
    	let current;

    	aside = new Aside({
    			props: {
    				width: "200px",
    				$$slots: { default: [create_default_slot_25$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot_24$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(aside.$$.fragment);
    			t = space();
    			create_component(main.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(aside, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const aside_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				aside_changes.$$scope = { dirty, ctx };
    			}

    			aside.$set(aside_changes);
    			const main_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aside.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(aside, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_23$1.name,
    		type: "slot",
    		source: "(22:0) <Container>",
    		ctx
    	});

    	return block;
    }

    // (28:2) <Header>
    function create_default_slot_22$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Header");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22$1.name,
    		type: "slot",
    		source: "(28:2) <Header>",
    		ctx
    	});

    	return block;
    }

    // (30:4) <Aside width="200px">
    function create_default_slot_21$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Aside");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21$1.name,
    		type: "slot",
    		source: "(30:4) <Aside width=\\\"200px\\\">",
    		ctx
    	});

    	return block;
    }

    // (31:4) <Main>
    function create_default_slot_20$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20$1.name,
    		type: "slot",
    		source: "(31:4) <Main>",
    		ctx
    	});

    	return block;
    }

    // (29:2) <Container>
    function create_default_slot_19$1(ctx) {
    	let aside;
    	let t;
    	let main;
    	let current;

    	aside = new Aside({
    			props: {
    				width: "200px",
    				$$slots: { default: [create_default_slot_21$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot_20$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(aside.$$.fragment);
    			t = space();
    			create_component(main.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(aside, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const aside_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				aside_changes.$$scope = { dirty, ctx };
    			}

    			aside.$set(aside_changes);
    			const main_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aside.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(aside, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19$1.name,
    		type: "slot",
    		source: "(29:2) <Container>",
    		ctx
    	});

    	return block;
    }

    // (27:0) <Container>
    function create_default_slot_18$1(ctx) {
    	let header;
    	let t;
    	let container;
    	let current;

    	header = new Header({
    			props: {
    				$$slots: { default: [create_default_slot_22$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_19$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18$1.name,
    		type: "slot",
    		source: "(27:0) <Container>",
    		ctx
    	});

    	return block;
    }

    // (36:2) <Header>
    function create_default_slot_17$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Header");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17$1.name,
    		type: "slot",
    		source: "(36:2) <Header>",
    		ctx
    	});

    	return block;
    }

    // (38:4) <Aside width="200px">
    function create_default_slot_16$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Aside");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16$1.name,
    		type: "slot",
    		source: "(38:4) <Aside width=\\\"200px\\\">",
    		ctx
    	});

    	return block;
    }

    // (40:6) <Main>
    function create_default_slot_15$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15$2.name,
    		type: "slot",
    		source: "(40:6) <Main>",
    		ctx
    	});

    	return block;
    }

    // (41:6) <Footer>
    function create_default_slot_14$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Footer");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14$2.name,
    		type: "slot",
    		source: "(41:6) <Footer>",
    		ctx
    	});

    	return block;
    }

    // (39:4) <Container>
    function create_default_slot_13$2(ctx) {
    	let main;
    	let t;
    	let footer;
    	let current;

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot_15$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({
    			props: {
    				$$slots: { default: [create_default_slot_14$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(main.$$.fragment);
    			t = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(main, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const main_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    			const footer_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				footer_changes.$$scope = { dirty, ctx };
    			}

    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13$2.name,
    		type: "slot",
    		source: "(39:4) <Container>",
    		ctx
    	});

    	return block;
    }

    // (37:2) <Container>
    function create_default_slot_12$2(ctx) {
    	let aside;
    	let t;
    	let container;
    	let current;

    	aside = new Aside({
    			props: {
    				width: "200px",
    				$$slots: { default: [create_default_slot_16$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_13$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(aside.$$.fragment);
    			t = space();
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(aside, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const aside_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				aside_changes.$$scope = { dirty, ctx };
    			}

    			aside.$set(aside_changes);
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside.$$.fragment, local);
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aside.$$.fragment, local);
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(aside, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12$2.name,
    		type: "slot",
    		source: "(37:2) <Container>",
    		ctx
    	});

    	return block;
    }

    // (35:0) <Container>
    function create_default_slot_11$2(ctx) {
    	let header;
    	let t;
    	let container;
    	let current;

    	header = new Header({
    			props: {
    				$$slots: { default: [create_default_slot_17$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_12$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11$2.name,
    		type: "slot",
    		source: "(35:0) <Container>",
    		ctx
    	});

    	return block;
    }

    // (47:2) <Aside width="200px">
    function create_default_slot_10$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Aside");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10$2.name,
    		type: "slot",
    		source: "(47:2) <Aside width=\\\"200px\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:4) <Header>
    function create_default_slot_9$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Header");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9$2.name,
    		type: "slot",
    		source: "(49:4) <Header>",
    		ctx
    	});

    	return block;
    }

    // (50:4) <Main>
    function create_default_slot_8$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$2.name,
    		type: "slot",
    		source: "(50:4) <Main>",
    		ctx
    	});

    	return block;
    }

    // (48:2) <Container>
    function create_default_slot_7$2(ctx) {
    	let header;
    	let t;
    	let main;
    	let current;

    	header = new Header({
    			props: {
    				$$slots: { default: [create_default_slot_9$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot_8$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(main.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const main_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$2.name,
    		type: "slot",
    		source: "(48:2) <Container>",
    		ctx
    	});

    	return block;
    }

    // (46:0) <Container>
    function create_default_slot_6$2(ctx) {
    	let aside;
    	let t;
    	let container;
    	let current;

    	aside = new Aside({
    			props: {
    				width: "200px",
    				$$slots: { default: [create_default_slot_10$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_7$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(aside.$$.fragment);
    			t = space();
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(aside, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const aside_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				aside_changes.$$scope = { dirty, ctx };
    			}

    			aside.$set(aside_changes);
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside.$$.fragment, local);
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aside.$$.fragment, local);
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(aside, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$2.name,
    		type: "slot",
    		source: "(46:0) <Container>",
    		ctx
    	});

    	return block;
    }

    // (55:2) <Aside width="200px">
    function create_default_slot_5$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Aside");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(55:2) <Aside width=\\\"200px\\\">",
    		ctx
    	});

    	return block;
    }

    // (57:4) <Header class="el-header">
    function create_default_slot_4$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Header");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(57:4) <Header class=\\\"el-header\\\">",
    		ctx
    	});

    	return block;
    }

    // (58:4) <Main>
    function create_default_slot_3$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(58:4) <Main>",
    		ctx
    	});

    	return block;
    }

    // (59:4) <Footer>
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Footer");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(59:4) <Footer>",
    		ctx
    	});

    	return block;
    }

    // (56:2) <Container>
    function create_default_slot_1$2(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				class: "el-header",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(main.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(main, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const main_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    			const footer_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				footer_changes.$$scope = { dirty, ctx };
    			}

    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(56:2) <Container>",
    		ctx
    	});

    	return block;
    }

    // (54:0) <Container>
    function create_default_slot$3(ctx) {
    	let aside;
    	let t;
    	let container;
    	let current;

    	aside = new Aside({
    			props: {
    				width: "200px",
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(aside.$$.fragment);
    			t = space();
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(aside, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const aside_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				aside_changes.$$scope = { dirty, ctx };
    			}

    			aside.$set(aside_changes);
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside.$$.fragment, local);
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aside.$$.fragment, local);
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(aside, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(54:0) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let container0;
    	let t0;
    	let container1;
    	let t1;
    	let container2;
    	let t2;
    	let container3;
    	let t3;
    	let container4;
    	let t4;
    	let container5;
    	let t5;
    	let container6;
    	let current;

    	container0 = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_30$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container1 = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_26$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container2 = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_23$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container3 = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_18$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container4 = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_11$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container5 = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_6$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	container6 = new Container({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container0.$$.fragment);
    			t0 = space();
    			create_component(container1.$$.fragment);
    			t1 = space();
    			create_component(container2.$$.fragment);
    			t2 = space();
    			create_component(container3.$$.fragment);
    			t3 = space();
    			create_component(container4.$$.fragment);
    			t4 = space();
    			create_component(container5.$$.fragment);
    			t5 = space();
    			create_component(container6.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(container0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(container1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(container2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(container3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(container4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(container5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(container6, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const container0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container0_changes.$$scope = { dirty, ctx };
    			}

    			container0.$set(container0_changes);
    			const container1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container1_changes.$$scope = { dirty, ctx };
    			}

    			container1.$set(container1_changes);
    			const container2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container2_changes.$$scope = { dirty, ctx };
    			}

    			container2.$set(container2_changes);
    			const container3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container3_changes.$$scope = { dirty, ctx };
    			}

    			container3.$set(container3_changes);
    			const container4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container4_changes.$$scope = { dirty, ctx };
    			}

    			container4.$set(container4_changes);
    			const container5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container5_changes.$$scope = { dirty, ctx };
    			}

    			container5.$set(container5_changes);
    			const container6_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container6_changes.$$scope = { dirty, ctx };
    			}

    			container6.$set(container6_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container0.$$.fragment, local);
    			transition_in(container1.$$.fragment, local);
    			transition_in(container2.$$.fragment, local);
    			transition_in(container3.$$.fragment, local);
    			transition_in(container4.$$.fragment, local);
    			transition_in(container5.$$.fragment, local);
    			transition_in(container6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container0.$$.fragment, local);
    			transition_out(container1.$$.fragment, local);
    			transition_out(container2.$$.fragment, local);
    			transition_out(container3.$$.fragment, local);
    			transition_out(container4.$$.fragment, local);
    			transition_out(container5.$$.fragment, local);
    			transition_out(container6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(container1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(container2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(container3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(container4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(container5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(container6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Container', slots, []);

    	const item = {
    		date: "2016-05-02",
    		name: "王小虎",
    		address: "上海市普陀区金沙江路 1518 弄"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Container> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Container,
    		Header,
    		Main,
    		Footer,
    		Aside,
    		item
    	});

    	return [];
    }

    class Container_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container_1",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\doc\Icon.svelte generated by Svelte v3.46.4 */
    const file$3 = "src\\doc\\Icon.svelte";

    // (27:0) <Button type="primary" icon="el-icon-search">
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("搜索");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(27:0) <Button type=\\\"primary\\\" icon=\\\"el-icon-search\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let icon0;
    	let t0;
    	let icon1;
    	let t1;
    	let icon2;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let icon3;
    	let t5;
    	let icon4;
    	let t6;
    	let icon5;
    	let t7;
    	let br2;
    	let t8;
    	let br3;
    	let t9;
    	let icon6;
    	let t10;
    	let icon7;
    	let t11;
    	let icon8;
    	let t12;
    	let br4;
    	let t13;
    	let br5;
    	let t14;
    	let icon9;
    	let t15;
    	let icon10;
    	let t16;
    	let icon11;
    	let t17;
    	let br6;
    	let t18;
    	let br7;
    	let t19;
    	let button;
    	let current;

    	icon0 = new Icon({
    			props: { class: "el-icon-edit" },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { class: "el-icon-share" },
    			$$inline: true
    		});

    	icon2 = new Icon({
    			props: { class: "el-icon-delete" },
    			$$inline: true
    		});

    	icon3 = new Icon({
    			props: { icon: "el-icon-edit" },
    			$$inline: true
    		});

    	icon4 = new Icon({
    			props: { icon: "el-icon-share" },
    			$$inline: true
    		});

    	icon5 = new Icon({
    			props: { icon: "el-icon-delete" },
    			$$inline: true
    		});

    	icon6 = new Icon({ props: { icon: "edit" }, $$inline: true });
    	icon7 = new Icon({ props: { icon: "share" }, $$inline: true });

    	icon8 = new Icon({
    			props: { icon: "delete" },
    			$$inline: true
    		});

    	icon9 = new Icon({ props: { name: "edit" }, $$inline: true });
    	icon10 = new Icon({ props: { name: "share" }, $$inline: true });

    	icon11 = new Icon({
    			props: { name: "delete" },
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				type: "primary",
    				icon: "el-icon-search",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icon0.$$.fragment);
    			t0 = space();
    			create_component(icon1.$$.fragment);
    			t1 = space();
    			create_component(icon2.$$.fragment);
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			create_component(icon3.$$.fragment);
    			t5 = space();
    			create_component(icon4.$$.fragment);
    			t6 = space();
    			create_component(icon5.$$.fragment);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			br3 = element("br");
    			t9 = space();
    			create_component(icon6.$$.fragment);
    			t10 = space();
    			create_component(icon7.$$.fragment);
    			t11 = space();
    			create_component(icon8.$$.fragment);
    			t12 = space();
    			br4 = element("br");
    			t13 = space();
    			br5 = element("br");
    			t14 = space();
    			create_component(icon9.$$.fragment);
    			t15 = space();
    			create_component(icon10.$$.fragment);
    			t16 = space();
    			create_component(icon11.$$.fragment);
    			t17 = space();
    			br6 = element("br");
    			t18 = space();
    			br7 = element("br");
    			t19 = space();
    			create_component(button.$$.fragment);
    			add_location(br0, file$3, 9, 0, 198);
    			add_location(br1, file$3, 10, 0, 204);
    			add_location(br2, file$3, 14, 0, 303);
    			add_location(br3, file$3, 15, 0, 309);
    			add_location(br4, file$3, 19, 0, 384);
    			add_location(br5, file$3, 20, 0, 390);
    			add_location(br6, file$3, 24, 0, 465);
    			add_location(br7, file$3, 25, 0, 471);
    			attr_dev(div, "class", "demo-icon source");
    			add_location(div, file$3, 4, 0, 68);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon0, div, null);
    			append_dev(div, t0);
    			mount_component(icon1, div, null);
    			append_dev(div, t1);
    			mount_component(icon2, div, null);
    			append_dev(div, t2);
    			append_dev(div, br0);
    			append_dev(div, t3);
    			append_dev(div, br1);
    			append_dev(div, t4);
    			mount_component(icon3, div, null);
    			append_dev(div, t5);
    			mount_component(icon4, div, null);
    			append_dev(div, t6);
    			mount_component(icon5, div, null);
    			append_dev(div, t7);
    			append_dev(div, br2);
    			append_dev(div, t8);
    			append_dev(div, br3);
    			append_dev(div, t9);
    			mount_component(icon6, div, null);
    			append_dev(div, t10);
    			mount_component(icon7, div, null);
    			append_dev(div, t11);
    			mount_component(icon8, div, null);
    			append_dev(div, t12);
    			append_dev(div, br4);
    			append_dev(div, t13);
    			append_dev(div, br5);
    			append_dev(div, t14);
    			mount_component(icon9, div, null);
    			append_dev(div, t15);
    			mount_component(icon10, div, null);
    			append_dev(div, t16);
    			mount_component(icon11, div, null);
    			append_dev(div, t17);
    			append_dev(div, br6);
    			append_dev(div, t18);
    			append_dev(div, br7);
    			append_dev(div, t19);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			transition_in(icon3.$$.fragment, local);
    			transition_in(icon4.$$.fragment, local);
    			transition_in(icon5.$$.fragment, local);
    			transition_in(icon6.$$.fragment, local);
    			transition_in(icon7.$$.fragment, local);
    			transition_in(icon8.$$.fragment, local);
    			transition_in(icon9.$$.fragment, local);
    			transition_in(icon10.$$.fragment, local);
    			transition_in(icon11.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			transition_out(icon3.$$.fragment, local);
    			transition_out(icon4.$$.fragment, local);
    			transition_out(icon5.$$.fragment, local);
    			transition_out(icon6.$$.fragment, local);
    			transition_out(icon7.$$.fragment, local);
    			transition_out(icon8.$$.fragment, local);
    			transition_out(icon9.$$.fragment, local);
    			transition_out(icon10.$$.fragment, local);
    			transition_out(icon11.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    			destroy_component(icon3);
    			destroy_component(icon4);
    			destroy_component(icon5);
    			destroy_component(icon6);
    			destroy_component(icon7);
    			destroy_component(icon8);
    			destroy_component(icon9);
    			destroy_component(icon10);
    			destroy_component(icon11);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Icon, Button });
    	return [];
    }

    class Icon_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon_1",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\doc\Link.svelte generated by Svelte v3.46.4 */
    const file$2 = "src\\doc\\Link.svelte";

    // (10:8) <Link href="https://element.eleme.io" target="_blank">
    function create_default_slot_15$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("默认链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15$1.name,
    		type: "slot",
    		source: "(10:8) <Link href=\\\"https://element.eleme.io\\\" target=\\\"_blank\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:8) <Link type="primary" on:click={onclcick}>
    function create_default_slot_14$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("主要链接可点击");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14$1.name,
    		type: "slot",
    		source: "(11:8) <Link type=\\\"primary\\\" on:click={onclcick}>",
    		ctx
    	});

    	return block;
    }

    // (12:8) <Link type="success">
    function create_default_slot_13$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("成功链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13$1.name,
    		type: "slot",
    		source: "(12:8) <Link type=\\\"success\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:8) <Link type="warning">
    function create_default_slot_12$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("警告链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12$1.name,
    		type: "slot",
    		source: "(13:8) <Link type=\\\"warning\\\">",
    		ctx
    	});

    	return block;
    }

    // (14:8) <Link type="danger">
    function create_default_slot_11$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("危险链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11$1.name,
    		type: "slot",
    		source: "(14:8) <Link type=\\\"danger\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:8) <Link type="info">
    function create_default_slot_10$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("信息链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10$1.name,
    		type: "slot",
    		source: "(15:8) <Link type=\\\"info\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:8) <Link disabled>
    function create_default_slot_9$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("默认链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9$1.name,
    		type: "slot",
    		source: "(20:8) <Link disabled>",
    		ctx
    	});

    	return block;
    }

    // (21:8) <Link type="primary" disabled>
    function create_default_slot_8$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("主要链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(21:8) <Link type=\\\"primary\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (22:8) <Link type="success" disabled>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("成功链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(22:8) <Link type=\\\"success\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (23:8) <Link type="warning" disabled>
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("警告链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(23:8) <Link type=\\\"warning\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (24:8) <Link type="danger" disabled>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("危险链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(24:8) <Link type=\\\"danger\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (25:8) <Link type="info" disabled>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("信息链接");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(25:8) <Link type=\\\"info\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (30:8) <Link underline={false}>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("无下划线");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(30:8) <Link underline={false}>",
    		ctx
    	});

    	return block;
    }

    // (31:8) <Link>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("有下划线");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(31:8) <Link>",
    		ctx
    	});

    	return block;
    }

    // (36:8) <Link icon="el-icon-edit">
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("编辑");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(36:8) <Link icon=\\\"el-icon-edit\\\">",
    		ctx
    	});

    	return block;
    }

    // (37:8) <Link>
    function create_default_slot$1(ctx) {
    	let t;
    	let i;

    	const block = {
    		c: function create() {
    			t = text("查看");
    			i = element("i");
    			attr_dev(i, "class", "el-icon-view el-icon--right");
    			add_location(i, file$2, 36, 16, 1022);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(37:8) <Link>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let link3;
    	let t3;
    	let link4;
    	let t4;
    	let link5;
    	let t5;
    	let br0;
    	let t6;
    	let br1;
    	let t7;
    	let div1;
    	let link6;
    	let t8;
    	let link7;
    	let t9;
    	let link8;
    	let t10;
    	let link9;
    	let t11;
    	let link10;
    	let t12;
    	let link11;
    	let t13;
    	let br2;
    	let t14;
    	let br3;
    	let t15;
    	let div2;
    	let link12;
    	let t16;
    	let link13;
    	let t17;
    	let br4;
    	let t18;
    	let br5;
    	let t19;
    	let div3;
    	let link14;
    	let t20;
    	let link15;
    	let t21;
    	let br6;
    	let t22;
    	let br7;
    	let current;

    	link0 = new Link({
    			props: {
    				href: "https://element.eleme.io",
    				target: "_blank",
    				$$slots: { default: [create_default_slot_15$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				type: "primary",
    				$$slots: { default: [create_default_slot_14$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1.$on("click", onclcick);

    	link2 = new Link({
    			props: {
    				type: "success",
    				$$slots: { default: [create_default_slot_13$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link3 = new Link({
    			props: {
    				type: "warning",
    				$$slots: { default: [create_default_slot_12$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link4 = new Link({
    			props: {
    				type: "danger",
    				$$slots: { default: [create_default_slot_11$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link5 = new Link({
    			props: {
    				type: "info",
    				$$slots: { default: [create_default_slot_10$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link6 = new Link({
    			props: {
    				disabled: true,
    				$$slots: { default: [create_default_slot_9$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link7 = new Link({
    			props: {
    				type: "primary",
    				disabled: true,
    				$$slots: { default: [create_default_slot_8$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link8 = new Link({
    			props: {
    				type: "success",
    				disabled: true,
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link9 = new Link({
    			props: {
    				type: "warning",
    				disabled: true,
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link10 = new Link({
    			props: {
    				type: "danger",
    				disabled: true,
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link11 = new Link({
    			props: {
    				type: "info",
    				disabled: true,
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link12 = new Link({
    			props: {
    				underline: false,
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link13 = new Link({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link14 = new Link({
    			props: {
    				icon: "el-icon-edit",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link15 = new Link({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			create_component(link1.$$.fragment);
    			t1 = space();
    			create_component(link2.$$.fragment);
    			t2 = space();
    			create_component(link3.$$.fragment);
    			t3 = space();
    			create_component(link4.$$.fragment);
    			t4 = space();
    			create_component(link5.$$.fragment);
    			t5 = space();
    			br0 = element("br");
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			div1 = element("div");
    			create_component(link6.$$.fragment);
    			t8 = space();
    			create_component(link7.$$.fragment);
    			t9 = space();
    			create_component(link8.$$.fragment);
    			t10 = space();
    			create_component(link9.$$.fragment);
    			t11 = space();
    			create_component(link10.$$.fragment);
    			t12 = space();
    			create_component(link11.$$.fragment);
    			t13 = space();
    			br2 = element("br");
    			t14 = space();
    			br3 = element("br");
    			t15 = space();
    			div2 = element("div");
    			create_component(link12.$$.fragment);
    			t16 = space();
    			create_component(link13.$$.fragment);
    			t17 = space();
    			br4 = element("br");
    			t18 = space();
    			br5 = element("br");
    			t19 = space();
    			div3 = element("div");
    			create_component(link14.$$.fragment);
    			t20 = space();
    			create_component(link15.$$.fragment);
    			t21 = space();
    			br6 = element("br");
    			t22 = space();
    			br7 = element("br");
    			add_location(div0, file$2, 8, 4, 150);
    			add_location(br0, file$2, 16, 4, 477);
    			add_location(br1, file$2, 17, 4, 489);
    			add_location(div1, file$2, 18, 4, 501);
    			add_location(br2, file$2, 26, 4, 811);
    			add_location(br3, file$2, 27, 4, 823);
    			add_location(div2, file$2, 28, 4, 835);
    			add_location(br4, file$2, 32, 4, 930);
    			add_location(br5, file$2, 33, 4, 942);
    			add_location(div3, file$2, 34, 4, 954);
    			add_location(br6, file$2, 38, 4, 1088);
    			add_location(br7, file$2, 39, 4, 1100);
    			attr_dev(div4, "class", "demo-icon source");
    			add_location(div4, file$2, 7, 0, 114);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(link0, div0, null);
    			append_dev(div0, t0);
    			mount_component(link1, div0, null);
    			append_dev(div0, t1);
    			mount_component(link2, div0, null);
    			append_dev(div0, t2);
    			mount_component(link3, div0, null);
    			append_dev(div0, t3);
    			mount_component(link4, div0, null);
    			append_dev(div0, t4);
    			mount_component(link5, div0, null);
    			append_dev(div4, t5);
    			append_dev(div4, br0);
    			append_dev(div4, t6);
    			append_dev(div4, br1);
    			append_dev(div4, t7);
    			append_dev(div4, div1);
    			mount_component(link6, div1, null);
    			append_dev(div1, t8);
    			mount_component(link7, div1, null);
    			append_dev(div1, t9);
    			mount_component(link8, div1, null);
    			append_dev(div1, t10);
    			mount_component(link9, div1, null);
    			append_dev(div1, t11);
    			mount_component(link10, div1, null);
    			append_dev(div1, t12);
    			mount_component(link11, div1, null);
    			append_dev(div4, t13);
    			append_dev(div4, br2);
    			append_dev(div4, t14);
    			append_dev(div4, br3);
    			append_dev(div4, t15);
    			append_dev(div4, div2);
    			mount_component(link12, div2, null);
    			append_dev(div2, t16);
    			mount_component(link13, div2, null);
    			append_dev(div4, t17);
    			append_dev(div4, br4);
    			append_dev(div4, t18);
    			append_dev(div4, br5);
    			append_dev(div4, t19);
    			append_dev(div4, div3);
    			mount_component(link14, div3, null);
    			append_dev(div3, t20);
    			mount_component(link15, div3, null);
    			append_dev(div4, t21);
    			append_dev(div4, br6);
    			append_dev(div4, t22);
    			append_dev(div4, br7);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    			const link6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link6_changes.$$scope = { dirty, ctx };
    			}

    			link6.$set(link6_changes);
    			const link7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link7_changes.$$scope = { dirty, ctx };
    			}

    			link7.$set(link7_changes);
    			const link8_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link8_changes.$$scope = { dirty, ctx };
    			}

    			link8.$set(link8_changes);
    			const link9_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link9_changes.$$scope = { dirty, ctx };
    			}

    			link9.$set(link9_changes);
    			const link10_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link10_changes.$$scope = { dirty, ctx };
    			}

    			link10.$set(link10_changes);
    			const link11_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link11_changes.$$scope = { dirty, ctx };
    			}

    			link11.$set(link11_changes);
    			const link12_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link12_changes.$$scope = { dirty, ctx };
    			}

    			link12.$set(link12_changes);
    			const link13_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link13_changes.$$scope = { dirty, ctx };
    			}

    			link13.$set(link13_changes);
    			const link14_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link14_changes.$$scope = { dirty, ctx };
    			}

    			link14.$set(link14_changes);
    			const link15_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link15_changes.$$scope = { dirty, ctx };
    			}

    			link15.$set(link15_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			transition_in(link6.$$.fragment, local);
    			transition_in(link7.$$.fragment, local);
    			transition_in(link8.$$.fragment, local);
    			transition_in(link9.$$.fragment, local);
    			transition_in(link10.$$.fragment, local);
    			transition_in(link11.$$.fragment, local);
    			transition_in(link12.$$.fragment, local);
    			transition_in(link13.$$.fragment, local);
    			transition_in(link14.$$.fragment, local);
    			transition_in(link15.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			transition_out(link6.$$.fragment, local);
    			transition_out(link7.$$.fragment, local);
    			transition_out(link8.$$.fragment, local);
    			transition_out(link9.$$.fragment, local);
    			transition_out(link10.$$.fragment, local);
    			transition_out(link11.$$.fragment, local);
    			transition_out(link12.$$.fragment, local);
    			transition_out(link13.$$.fragment, local);
    			transition_out(link14.$$.fragment, local);
    			transition_out(link15.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    			destroy_component(link6);
    			destroy_component(link7);
    			destroy_component(link8);
    			destroy_component(link9);
    			destroy_component(link10);
    			destroy_component(link11);
    			destroy_component(link12);
    			destroy_component(link13);
    			destroy_component(link14);
    			destroy_component(link15);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onclcick() {
    	alert('ok');
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link, onclcick });
    	return [];
    }

    class Link_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link_1",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\doc\Radio.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file$1 = "src\\doc\\Radio.svelte";

    // (31:0) <Radio bind:value="{test[3]}" label="1" on:change={Radiochange}>
    function create_default_slot_46(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项 A");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_46.name,
    		type: "slot",
    		source: "(31:0) <Radio bind:value=\\\"{test[3]}\\\" label=\\\"1\\\" on:change={Radiochange}>",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Radio bind:value="{test[3]}" label="2" on:change={Radiochange}>
    function create_default_slot_45(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项 A");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_45.name,
    		type: "slot",
    		source: "(32:0) <Radio bind:value=\\\"{test[3]}\\\" label=\\\"2\\\" on:change={Radiochange}>",
    		ctx
    	});

    	return block;
    }

    // (33:0) <Radio bind:value="{test[3]}" label="3" on:change={Radiochange}>
    function create_default_slot_44(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项 A");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_44.name,
    		type: "slot",
    		source: "(33:0) <Radio bind:value=\\\"{test[3]}\\\" label=\\\"3\\\" on:change={Radiochange}>",
    		ctx
    	});

    	return block;
    }

    // (35:0) <Radio bind:value="{test[4]}" label="1">
    function create_default_slot_43(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项 B");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_43.name,
    		type: "slot",
    		source: "(35:0) <Radio bind:value=\\\"{test[4]}\\\" label=\\\"1\\\">",
    		ctx
    	});

    	return block;
    }

    // (36:0) <Radio bind:value="{test[4]}" label="2">
    function create_default_slot_42(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项 B");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_42.name,
    		type: "slot",
    		source: "(36:0) <Radio bind:value=\\\"{test[4]}\\\" label=\\\"2\\\">",
    		ctx
    	});

    	return block;
    }

    // (37:0) <Radio bind:value="{test[4]}" label="3">
    function create_default_slot_41(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项 B");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_41.name,
    		type: "slot",
    		source: "(37:0) <Radio bind:value=\\\"{test[4]}\\\" label=\\\"3\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:0) <Radio bind:value="{test[5]}" disabled label="禁用">
    function create_default_slot_40(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_40.name,
    		type: "slot",
    		source: "(39:0) <Radio bind:value=\\\"{test[5]}\\\" disabled label=\\\"禁用\\\">",
    		ctx
    	});

    	return block;
    }

    // (40:0) <Radio bind:value="{test[5]}" disabled label="选中且禁用">
    function create_default_slot_39(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_39.name,
    		type: "slot",
    		source: "(40:0) <Radio bind:value=\\\"{test[5]}\\\" disabled label=\\\"选中且禁用\\\">",
    		ctx
    	});

    	return block;
    }

    // (59:4) <Radio label="3">
    function create_default_slot_38(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项点击取值");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_38.name,
    		type: "slot",
    		source: "(59:4) <Radio label=\\\"3\\\">",
    		ctx
    	});

    	return block;
    }

    // (60:4) <Radio label="6">
    function create_default_slot_37(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项点击取值");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_37.name,
    		type: "slot",
    		source: "(60:4) <Radio label=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (61:4) <Radio label="9">
    function create_default_slot_36(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项点击取值");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_36.name,
    		type: "slot",
    		source: "(61:4) <Radio label=\\\"9\\\">",
    		ctx
    	});

    	return block;
    }

    // (58:0) <RadioGroup bind:value="{test[6]}" on:change={RadioGroupchange}>
    function create_default_slot_35(ctx) {
    	let radio0;
    	let t0;
    	let radio1;
    	let t1;
    	let radio2;
    	let current;

    	radio0 = new Radio({
    			props: {
    				label: "3",
    				$$slots: { default: [create_default_slot_38] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio1 = new Radio({
    			props: {
    				label: "6",
    				$$slots: { default: [create_default_slot_37] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio2 = new Radio({
    			props: {
    				label: "9",
    				$$slots: { default: [create_default_slot_36] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t0 = space();
    			create_component(radio1.$$.fragment);
    			t1 = space();
    			create_component(radio2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radio1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radio2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio0_changes.$$scope = { dirty, ctx };
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio1_changes.$$scope = { dirty, ctx };
    			}

    			radio1.$set(radio1_changes);
    			const radio2_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio2_changes.$$scope = { dirty, ctx };
    			}

    			radio2.$set(radio2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			transition_in(radio2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			transition_out(radio2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radio1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radio2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_35.name,
    		type: "slot",
    		source: "(58:0) <RadioGroup bind:value=\\\"{test[6]}\\\" on:change={RadioGroupchange}>",
    		ctx
    	});

    	return block;
    }

    // (65:4) <Radio label="3" border>
    function create_default_slot_34(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项medium");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_34.name,
    		type: "slot",
    		source: "(65:4) <Radio label=\\\"3\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (66:4) <Radio label="6" >
    function create_default_slot_33(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项medium");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_33.name,
    		type: "slot",
    		source: "(66:4) <Radio label=\\\"6\\\" >",
    		ctx
    	});

    	return block;
    }

    // (67:4) <Radio label="9">
    function create_default_slot_32(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项medium");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_32.name,
    		type: "slot",
    		source: "(67:4) <Radio label=\\\"9\\\">",
    		ctx
    	});

    	return block;
    }

    // (64:0) <RadioGroup bind:value="{test[6]}" size="medium">
    function create_default_slot_31(ctx) {
    	let radio0;
    	let t0;
    	let radio1;
    	let t1;
    	let radio2;
    	let current;

    	radio0 = new Radio({
    			props: {
    				label: "3",
    				border: true,
    				$$slots: { default: [create_default_slot_34] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio1 = new Radio({
    			props: {
    				label: "6",
    				$$slots: { default: [create_default_slot_33] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio2 = new Radio({
    			props: {
    				label: "9",
    				$$slots: { default: [create_default_slot_32] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t0 = space();
    			create_component(radio1.$$.fragment);
    			t1 = space();
    			create_component(radio2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radio1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radio2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio0_changes.$$scope = { dirty, ctx };
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio1_changes.$$scope = { dirty, ctx };
    			}

    			radio1.$set(radio1_changes);
    			const radio2_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio2_changes.$$scope = { dirty, ctx };
    			}

    			radio2.$set(radio2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			transition_in(radio2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			transition_out(radio2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radio1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radio2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_31.name,
    		type: "slot",
    		source: "(64:0) <RadioGroup bind:value=\\\"{test[6]}\\\" size=\\\"medium\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:4) <Radio label="3">
    function create_default_slot_30(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项small");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_30.name,
    		type: "slot",
    		source: "(71:4) <Radio label=\\\"3\\\">",
    		ctx
    	});

    	return block;
    }

    // (72:4) <Radio label="6" border>
    function create_default_slot_29(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项small");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_29.name,
    		type: "slot",
    		source: "(72:4) <Radio label=\\\"6\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (73:4) <Radio label="9">
    function create_default_slot_28(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项small");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_28.name,
    		type: "slot",
    		source: "(73:4) <Radio label=\\\"9\\\">",
    		ctx
    	});

    	return block;
    }

    // (70:0) <RadioGroup bind:value="{test[6]}" size="small">
    function create_default_slot_27(ctx) {
    	let radio0;
    	let t0;
    	let radio1;
    	let t1;
    	let radio2;
    	let current;

    	radio0 = new Radio({
    			props: {
    				label: "3",
    				$$slots: { default: [create_default_slot_30] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio1 = new Radio({
    			props: {
    				label: "6",
    				border: true,
    				$$slots: { default: [create_default_slot_29] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio2 = new Radio({
    			props: {
    				label: "9",
    				$$slots: { default: [create_default_slot_28] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t0 = space();
    			create_component(radio1.$$.fragment);
    			t1 = space();
    			create_component(radio2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radio1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radio2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio0_changes.$$scope = { dirty, ctx };
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio1_changes.$$scope = { dirty, ctx };
    			}

    			radio1.$set(radio1_changes);
    			const radio2_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio2_changes.$$scope = { dirty, ctx };
    			}

    			radio2.$set(radio2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			transition_in(radio2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			transition_out(radio2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radio1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radio2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_27.name,
    		type: "slot",
    		source: "(70:0) <RadioGroup bind:value=\\\"{test[6]}\\\" size=\\\"small\\\">",
    		ctx
    	});

    	return block;
    }

    // (77:4) <Radio label="3" border>
    function create_default_slot_26(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项mini");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_26.name,
    		type: "slot",
    		source: "(77:4) <Radio label=\\\"3\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (78:4) <Radio label="6" border>
    function create_default_slot_25(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项mini");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_25.name,
    		type: "slot",
    		source: "(78:4) <Radio label=\\\"6\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (79:4) <Radio label="9" border>
    function create_default_slot_24(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项mini");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_24.name,
    		type: "slot",
    		source: "(79:4) <Radio label=\\\"9\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (76:0) <RadioGroup bind:value="{test[6]}" size="mini">
    function create_default_slot_23(ctx) {
    	let radio0;
    	let t0;
    	let radio1;
    	let t1;
    	let radio2;
    	let current;

    	radio0 = new Radio({
    			props: {
    				label: "3",
    				border: true,
    				$$slots: { default: [create_default_slot_26] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio1 = new Radio({
    			props: {
    				label: "6",
    				border: true,
    				$$slots: { default: [create_default_slot_25] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio2 = new Radio({
    			props: {
    				label: "9",
    				border: true,
    				$$slots: { default: [create_default_slot_24] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t0 = space();
    			create_component(radio1.$$.fragment);
    			t1 = space();
    			create_component(radio2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radio1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radio2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio0_changes.$$scope = { dirty, ctx };
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio1_changes.$$scope = { dirty, ctx };
    			}

    			radio1.$set(radio1_changes);
    			const radio2_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio2_changes.$$scope = { dirty, ctx };
    			}

    			radio2.$set(radio2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			transition_in(radio2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			transition_out(radio2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radio1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radio2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_23.name,
    		type: "slot",
    		source: "(76:0) <RadioGroup bind:value=\\\"{test[6]}\\\" size=\\\"mini\\\">",
    		ctx
    	});

    	return block;
    }

    // (83:4) <Radio label="3">
    function create_default_slot_22(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项disabled");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(83:4) <Radio label=\\\"3\\\">",
    		ctx
    	});

    	return block;
    }

    // (84:4) <Radio label="6">
    function create_default_slot_21(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项disabled");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21.name,
    		type: "slot",
    		source: "(84:4) <Radio label=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (85:4) <Radio label="9">
    function create_default_slot_20(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项disabled");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(85:4) <Radio label=\\\"9\\\">",
    		ctx
    	});

    	return block;
    }

    // (82:0) <RadioGroup bind:value="{test[6]}" disabled>
    function create_default_slot_19(ctx) {
    	let radio0;
    	let t0;
    	let radio1;
    	let t1;
    	let radio2;
    	let current;

    	radio0 = new Radio({
    			props: {
    				label: "3",
    				$$slots: { default: [create_default_slot_22] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio1 = new Radio({
    			props: {
    				label: "6",
    				$$slots: { default: [create_default_slot_21] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio2 = new Radio({
    			props: {
    				label: "9",
    				$$slots: { default: [create_default_slot_20] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t0 = space();
    			create_component(radio1.$$.fragment);
    			t1 = space();
    			create_component(radio2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radio1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radio2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio0_changes.$$scope = { dirty, ctx };
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio1_changes.$$scope = { dirty, ctx };
    			}

    			radio1.$set(radio1_changes);
    			const radio2_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio2_changes.$$scope = { dirty, ctx };
    			}

    			radio2.$set(radio2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			transition_in(radio2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			transition_out(radio2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radio1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radio2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(82:0) <RadioGroup bind:value=\\\"{test[6]}\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (89:4) <Radio bind:value="{test[7]}" label="3">
    function create_default_slot_18(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(89:4) <Radio bind:value=\\\"{test[7]}\\\" label=\\\"3\\\">",
    		ctx
    	});

    	return block;
    }

    // (90:4) <Radio bind:value="{test[7]}" label="6">
    function create_default_slot_17(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(90:4) <Radio bind:value=\\\"{test[7]}\\\" label=\\\"6\\\">",
    		ctx
    	});

    	return block;
    }

    // (91:4) <Radio bind:value="{test[7]}" label="9">
    function create_default_slot_16(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(91:4) <Radio bind:value=\\\"{test[7]}\\\" label=\\\"9\\\">",
    		ctx
    	});

    	return block;
    }

    // (88:0) <RadioGroup>
    function create_default_slot_15(ctx) {
    	let radio0;
    	let updating_value;
    	let t0;
    	let radio1;
    	let updating_value_1;
    	let t1;
    	let radio2;
    	let updating_value_2;
    	let current;

    	function radio0_value_binding_1(value) {
    		/*radio0_value_binding_1*/ ctx[25](value);
    	}

    	let radio0_props = {
    		label: "3",
    		$$slots: { default: [create_default_slot_18] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][7] !== void 0) {
    		radio0_props.value = /*test*/ ctx[0][7];
    	}

    	radio0 = new Radio({ props: radio0_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio0, 'value', radio0_value_binding_1));

    	function radio1_value_binding_1(value) {
    		/*radio1_value_binding_1*/ ctx[26](value);
    	}

    	let radio1_props = {
    		label: "6",
    		$$slots: { default: [create_default_slot_17] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][7] !== void 0) {
    		radio1_props.value = /*test*/ ctx[0][7];
    	}

    	radio1 = new Radio({ props: radio1_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio1, 'value', radio1_value_binding_1));

    	function radio2_value_binding_1(value) {
    		/*radio2_value_binding_1*/ ctx[27](value);
    	}

    	let radio2_props = {
    		label: "9",
    		$$slots: { default: [create_default_slot_16] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][7] !== void 0) {
    		radio2_props.value = /*test*/ ctx[0][7];
    	}

    	radio2 = new Radio({ props: radio2_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio2, 'value', radio2_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t0 = space();
    			create_component(radio1.$$.fragment);
    			t1 = space();
    			create_component(radio2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radio1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radio2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*test*/ 1) {
    				updating_value = true;
    				radio0_changes.value = /*test*/ ctx[0][7];
    				add_flush_callback(() => updating_value = false);
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_1 && dirty[0] & /*test*/ 1) {
    				updating_value_1 = true;
    				radio1_changes.value = /*test*/ ctx[0][7];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			radio1.$set(radio1_changes);
    			const radio2_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_2 && dirty[0] & /*test*/ 1) {
    				updating_value_2 = true;
    				radio2_changes.value = /*test*/ ctx[0][7];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			radio2.$set(radio2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			transition_in(radio2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			transition_out(radio2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radio1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radio2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(88:0) <RadioGroup>",
    		ctx
    	});

    	return block;
    }

    // (100:4) <RadioGroup bind:value="{test[8]}">
    function create_default_slot_14(ctx) {
    	let radiobutton0;
    	let t0;
    	let radiobutton1;
    	let t1;
    	let radiobutton2;
    	let t2;
    	let radiobutton3;
    	let current;

    	radiobutton0 = new RadioButton({
    			props: { label: "上海", text: "上海111" },
    			$$inline: true
    		});

    	radiobutton1 = new RadioButton({
    			props: { label: "北京", text: "北京111" },
    			$$inline: true
    		});

    	radiobutton2 = new RadioButton({
    			props: { label: "广州", text: "广州111" },
    			$$inline: true
    		});

    	radiobutton3 = new RadioButton({
    			props: { label: "深圳", text: "深圳111" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radiobutton0.$$.fragment);
    			t0 = space();
    			create_component(radiobutton1.$$.fragment);
    			t1 = space();
    			create_component(radiobutton2.$$.fragment);
    			t2 = space();
    			create_component(radiobutton3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiobutton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radiobutton1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radiobutton2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(radiobutton3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobutton0.$$.fragment, local);
    			transition_in(radiobutton1.$$.fragment, local);
    			transition_in(radiobutton2.$$.fragment, local);
    			transition_in(radiobutton3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobutton0.$$.fragment, local);
    			transition_out(radiobutton1.$$.fragment, local);
    			transition_out(radiobutton2.$$.fragment, local);
    			transition_out(radiobutton3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiobutton0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radiobutton1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radiobutton2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(radiobutton3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(100:4) <RadioGroup bind:value=\\\"{test[8]}\\\">",
    		ctx
    	});

    	return block;
    }

    // (109:4) <RadioGroup bind:value="{test[8]}" size="medium">
    function create_default_slot_13(ctx) {
    	let radiobutton0;
    	let t0;
    	let radiobutton1;
    	let t1;
    	let radiobutton2;
    	let t2;
    	let radiobutton3;
    	let current;
    	radiobutton0 = new RadioButton({ props: { label: "上海" }, $$inline: true });
    	radiobutton1 = new RadioButton({ props: { label: "北京" }, $$inline: true });
    	radiobutton2 = new RadioButton({ props: { label: "广州" }, $$inline: true });
    	radiobutton3 = new RadioButton({ props: { label: "深圳" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(radiobutton0.$$.fragment);
    			t0 = space();
    			create_component(radiobutton1.$$.fragment);
    			t1 = space();
    			create_component(radiobutton2.$$.fragment);
    			t2 = space();
    			create_component(radiobutton3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiobutton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radiobutton1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radiobutton2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(radiobutton3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobutton0.$$.fragment, local);
    			transition_in(radiobutton1.$$.fragment, local);
    			transition_in(radiobutton2.$$.fragment, local);
    			transition_in(radiobutton3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobutton0.$$.fragment, local);
    			transition_out(radiobutton1.$$.fragment, local);
    			transition_out(radiobutton2.$$.fragment, local);
    			transition_out(radiobutton3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiobutton0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radiobutton1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radiobutton2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(radiobutton3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(109:4) <RadioGroup bind:value=\\\"{test[8]}\\\" size=\\\"medium\\\">",
    		ctx
    	});

    	return block;
    }

    // (117:4) <RadioGroup bind:value="{test[8]}" size="small">
    function create_default_slot_12(ctx) {
    	let radiobutton0;
    	let t0;
    	let radiobutton1;
    	let t1;
    	let radiobutton2;
    	let t2;
    	let radiobutton3;
    	let current;
    	radiobutton0 = new RadioButton({ props: { label: "上海" }, $$inline: true });

    	radiobutton1 = new RadioButton({
    			props: { label: "北京", disabled: true },
    			$$inline: true
    		});

    	radiobutton2 = new RadioButton({ props: { label: "广州" }, $$inline: true });
    	radiobutton3 = new RadioButton({ props: { label: "深圳" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(radiobutton0.$$.fragment);
    			t0 = space();
    			create_component(radiobutton1.$$.fragment);
    			t1 = space();
    			create_component(radiobutton2.$$.fragment);
    			t2 = space();
    			create_component(radiobutton3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiobutton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radiobutton1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radiobutton2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(radiobutton3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobutton0.$$.fragment, local);
    			transition_in(radiobutton1.$$.fragment, local);
    			transition_in(radiobutton2.$$.fragment, local);
    			transition_in(radiobutton3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobutton0.$$.fragment, local);
    			transition_out(radiobutton1.$$.fragment, local);
    			transition_out(radiobutton2.$$.fragment, local);
    			transition_out(radiobutton3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiobutton0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radiobutton1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radiobutton2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(radiobutton3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(117:4) <RadioGroup bind:value=\\\"{test[8]}\\\" size=\\\"small\\\">",
    		ctx
    	});

    	return block;
    }

    // (125:4) <RadioGroup bind:value="{test[8]}" disabled size="mini">
    function create_default_slot_11(ctx) {
    	let radiobutton0;
    	let t0;
    	let radiobutton1;
    	let t1;
    	let radiobutton2;
    	let t2;
    	let radiobutton3;
    	let current;
    	radiobutton0 = new RadioButton({ props: { label: "上海" }, $$inline: true });
    	radiobutton1 = new RadioButton({ props: { label: "北京" }, $$inline: true });
    	radiobutton2 = new RadioButton({ props: { label: "广州" }, $$inline: true });
    	radiobutton3 = new RadioButton({ props: { label: "深圳" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(radiobutton0.$$.fragment);
    			t0 = space();
    			create_component(radiobutton1.$$.fragment);
    			t1 = space();
    			create_component(radiobutton2.$$.fragment);
    			t2 = space();
    			create_component(radiobutton3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiobutton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radiobutton1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radiobutton2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(radiobutton3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobutton0.$$.fragment, local);
    			transition_in(radiobutton1.$$.fragment, local);
    			transition_in(radiobutton2.$$.fragment, local);
    			transition_in(radiobutton3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobutton0.$$.fragment, local);
    			transition_out(radiobutton1.$$.fragment, local);
    			transition_out(radiobutton2.$$.fragment, local);
    			transition_out(radiobutton3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiobutton0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radiobutton1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radiobutton2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(radiobutton3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(125:4) <RadioGroup bind:value=\\\"{test[8]}\\\" disabled size=\\\"mini\\\">",
    		ctx
    	});

    	return block;
    }

    // (134:4) <Radio bind:value="{test[9]}" label="1" border>
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项1");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(134:4) <Radio bind:value=\\\"{test[9]}\\\" label=\\\"1\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (135:4) <Radio bind:value="{test[9]}" label="2" border>
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项2");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(135:4) <Radio bind:value=\\\"{test[9]}\\\" label=\\\"2\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (138:4) <Radio bind:value="{test[10]}" label="1" border size="medium">
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项1");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(138:4) <Radio bind:value=\\\"{test[10]}\\\" label=\\\"1\\\" border size=\\\"medium\\\">",
    		ctx
    	});

    	return block;
    }

    // (139:4) <Radio bind:value="{test[10]}" label="2" border size="medium">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项2");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(139:4) <Radio bind:value=\\\"{test[10]}\\\" label=\\\"2\\\" border size=\\\"medium\\\">",
    		ctx
    	});

    	return block;
    }

    // (143:8) <Radio label="1" border>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项1");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(143:8) <Radio label=\\\"1\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (144:8) <Radio label="2" border disabled>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项2");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(144:8) <Radio label=\\\"2\\\" border disabled>",
    		ctx
    	});

    	return block;
    }

    // (142:4) <RadioGroup bind:value="{test[0]}" size="small">
    function create_default_slot_4(ctx) {
    	let radio0;
    	let t;
    	let radio1;
    	let current;

    	radio0 = new Radio({
    			props: {
    				label: "1",
    				border: true,
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio1 = new Radio({
    			props: {
    				label: "2",
    				border: true,
    				disabled: true,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t = space();
    			create_component(radio1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(radio1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio0_changes.$$scope = { dirty, ctx };
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio1_changes.$$scope = { dirty, ctx };
    			}

    			radio1.$set(radio1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(radio1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(142:4) <RadioGroup bind:value=\\\"{test[0]}\\\" size=\\\"small\\\">",
    		ctx
    	});

    	return block;
    }

    // (149:8) <Radio label="1" border>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项1");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(149:8) <Radio label=\\\"1\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (150:8) <Radio label="2" border>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("备选项2");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(150:8) <Radio label=\\\"2\\\" border>",
    		ctx
    	});

    	return block;
    }

    // (148:4) <RadioGroup bind:value="{test[0]}" size="mini" disabled>
    function create_default_slot_1(ctx) {
    	let radio0;
    	let t;
    	let radio1;
    	let current;

    	radio0 = new Radio({
    			props: {
    				label: "1",
    				border: true,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	radio1 = new Radio({
    			props: {
    				label: "2",
    				border: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t = space();
    			create_component(radio1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(radio1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio0_changes.$$scope = { dirty, ctx };
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio1_changes.$$scope = { dirty, ctx };
    			}

    			radio1.$set(radio1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(radio1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(148:4) <RadioGroup bind:value=\\\"{test[0]}\\\" size=\\\"mini\\\" disabled>",
    		ctx
    	});

    	return block;
    }

    // (155:0) <RadioGroup bind:value="{test[8]}" textcolor="#000" fill="#333" backgroundcolor="#fff">
    function create_default_slot(ctx) {
    	let radiobutton0;
    	let t0;
    	let radiobutton1;
    	let t1;
    	let radiobutton2;
    	let t2;
    	let radiobutton3;
    	let current;

    	radiobutton0 = new RadioButton({
    			props: { label: "上海", text: "上海111" },
    			$$inline: true
    		});

    	radiobutton1 = new RadioButton({
    			props: { label: "北京", text: "北京111" },
    			$$inline: true
    		});

    	radiobutton2 = new RadioButton({
    			props: { label: "广州", text: "广州111" },
    			$$inline: true
    		});

    	radiobutton3 = new RadioButton({
    			props: { label: "深圳", text: "深圳111" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(radiobutton0.$$.fragment);
    			t0 = space();
    			create_component(radiobutton1.$$.fragment);
    			t1 = space();
    			create_component(radiobutton2.$$.fragment);
    			t2 = space();
    			create_component(radiobutton3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiobutton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radiobutton1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(radiobutton2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(radiobutton3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobutton0.$$.fragment, local);
    			transition_in(radiobutton1.$$.fragment, local);
    			transition_in(radiobutton2.$$.fragment, local);
    			transition_in(radiobutton3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobutton0.$$.fragment, local);
    			transition_out(radiobutton1.$$.fragment, local);
    			transition_out(radiobutton2.$$.fragment, local);
    			transition_out(radiobutton3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiobutton0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radiobutton1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(radiobutton2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(radiobutton3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(155:0) <RadioGroup bind:value=\\\"{test[8]}\\\" textcolor=\\\"#000\\\" fill=\\\"#333\\\" backgroundcolor=\\\"#fff\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let radio0;
    	let updating_value;
    	let t0;
    	let radio1;
    	let updating_value_1;
    	let t1;
    	let hr0;
    	let t2;
    	let radio2;
    	let updating_value_2;
    	let t3;
    	let radio3;
    	let updating_value_3;
    	let t4;
    	let hr1;
    	let t5;
    	let radio4;
    	let updating_value_4;
    	let t6;
    	let radio5;
    	let updating_value_5;
    	let t7;
    	let hr2;
    	let t8;
    	let radio6;
    	let updating_value_6;
    	let t9;
    	let radio7;
    	let updating_value_7;
    	let t10;
    	let radio8;
    	let updating_value_8;
    	let t11;
    	let hr3;
    	let t12;
    	let radio9;
    	let updating_value_9;
    	let t13;
    	let radio10;
    	let updating_value_10;
    	let t14;
    	let radio11;
    	let updating_value_11;
    	let t15;
    	let hr4;
    	let t16;
    	let radio12;
    	let updating_value_12;
    	let t17;
    	let radio13;
    	let updating_value_13;
    	let t18;
    	let hr5;
    	let t19;
    	let radiogroup0;
    	let updating_value_14;
    	let t20;
    	let hr6;
    	let t21;
    	let radiogroup1;
    	let updating_value_15;
    	let t22;
    	let hr7;
    	let t23;
    	let radiogroup2;
    	let updating_value_16;
    	let t24;
    	let hr8;
    	let t25;
    	let radiogroup3;
    	let updating_value_17;
    	let t26;
    	let hr9;
    	let t27;
    	let radiogroup4;
    	let updating_value_18;
    	let t28;
    	let hr10;
    	let t29;
    	let radiogroup5;
    	let updating_value_19;
    	let t30;
    	let hr11;
    	let t31;
    	let radiogroup6;
    	let updating_value_20;
    	let t32;
    	let hr12;
    	let t33;
    	let radiogroup7;
    	let updating_value_21;
    	let t34;
    	let hr13;
    	let t35;
    	let radiogroup8;
    	let t36;
    	let hr14;
    	let t37;
    	let radiobutton0;
    	let updating_value_22;
    	let t38;
    	let radiobutton1;
    	let updating_value_23;
    	let t39;
    	let radiobutton2;
    	let updating_value_24;
    	let t40;
    	let radiobutton3;
    	let updating_value_25;
    	let t41;
    	let hr15;
    	let t42;
    	let div0;
    	let radiogroup9;
    	let updating_value_26;
    	let t43;
    	let div1;
    	let radiogroup10;
    	let updating_value_27;
    	let t44;
    	let div2;
    	let radiogroup11;
    	let updating_value_28;
    	let t45;
    	let div3;
    	let radiogroup12;
    	let updating_value_29;
    	let t46;
    	let hr16;
    	let t47;
    	let div4;
    	let radio14;
    	let updating_value_30;
    	let t48;
    	let radio15;
    	let updating_value_31;
    	let t49;
    	let div5;
    	let radio16;
    	let updating_value_32;
    	let t50;
    	let radio17;
    	let updating_value_33;
    	let t51;
    	let div6;
    	let radiogroup13;
    	let updating_value_34;
    	let t52;
    	let div7;
    	let radiogroup14;
    	let updating_value_35;
    	let t53;
    	let br0;
    	let t54;
    	let br1;
    	let t55;
    	let radiogroup15;
    	let updating_value_36;
    	let t56;
    	let br2;
    	let t57;
    	let br3;
    	let t58;
    	let br4;
    	let t59;
    	let br5;
    	let current;

    	function radio0_value_binding(value) {
    		/*radio0_value_binding*/ ctx[3](value);
    	}

    	let radio0_props = { label: "1", text: "提示文本" };

    	if (/*test*/ ctx[0][0] !== void 0) {
    		radio0_props.value = /*test*/ ctx[0][0];
    	}

    	radio0 = new Radio({ props: radio0_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio0, 'value', radio0_value_binding));

    	function radio1_value_binding(value) {
    		/*radio1_value_binding*/ ctx[4](value);
    	}

    	let radio1_props = { label: "2", text: "提示文本2" };

    	if (/*test*/ ctx[0][0] !== void 0) {
    		radio1_props.value = /*test*/ ctx[0][0];
    	}

    	radio1 = new Radio({ props: radio1_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio1, 'value', radio1_value_binding));

    	function radio2_value_binding(value) {
    		/*radio2_value_binding*/ ctx[5](value);
    	}

    	let radio2_props = { label: "1", border: true, text: "边框提示文本" };

    	if (/*test*/ ctx[0][1] !== void 0) {
    		radio2_props.value = /*test*/ ctx[0][1];
    	}

    	radio2 = new Radio({ props: radio2_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio2, 'value', radio2_value_binding));

    	function radio3_value_binding(value) {
    		/*radio3_value_binding*/ ctx[6](value);
    	}

    	let radio3_props = {
    		label: "2",
    		border: true,
    		text: "边框提示文本2"
    	};

    	if (/*test*/ ctx[0][1] !== void 0) {
    		radio3_props.value = /*test*/ ctx[0][1];
    	}

    	radio3 = new Radio({ props: radio3_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio3, 'value', radio3_value_binding));

    	function radio4_value_binding(value) {
    		/*radio4_value_binding*/ ctx[7](value);
    	}

    	let radio4_props = {
    		label: "1",
    		border: true,
    		size: "mini",
    		text: "边框提示文本"
    	};

    	if (/*test*/ ctx[0][2] !== void 0) {
    		radio4_props.value = /*test*/ ctx[0][2];
    	}

    	radio4 = new Radio({ props: radio4_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio4, 'value', radio4_value_binding));

    	function radio5_value_binding(value) {
    		/*radio5_value_binding*/ ctx[8](value);
    	}

    	let radio5_props = {
    		label: "2",
    		border: true,
    		size: "mini",
    		text: "边框提示文本2"
    	};

    	if (/*test*/ ctx[0][2] !== void 0) {
    		radio5_props.value = /*test*/ ctx[0][2];
    	}

    	radio5 = new Radio({ props: radio5_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio5, 'value', radio5_value_binding));

    	function radio6_value_binding(value) {
    		/*radio6_value_binding*/ ctx[9](value);
    	}

    	let radio6_props = {
    		label: "1",
    		$$slots: { default: [create_default_slot_46] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][3] !== void 0) {
    		radio6_props.value = /*test*/ ctx[0][3];
    	}

    	radio6 = new Radio({ props: radio6_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio6, 'value', radio6_value_binding));
    	radio6.$on("change", /*Radiochange*/ ctx[1]);

    	function radio7_value_binding(value) {
    		/*radio7_value_binding*/ ctx[10](value);
    	}

    	let radio7_props = {
    		label: "2",
    		$$slots: { default: [create_default_slot_45] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][3] !== void 0) {
    		radio7_props.value = /*test*/ ctx[0][3];
    	}

    	radio7 = new Radio({ props: radio7_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio7, 'value', radio7_value_binding));
    	radio7.$on("change", /*Radiochange*/ ctx[1]);

    	function radio8_value_binding(value) {
    		/*radio8_value_binding*/ ctx[11](value);
    	}

    	let radio8_props = {
    		label: "3",
    		$$slots: { default: [create_default_slot_44] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][3] !== void 0) {
    		radio8_props.value = /*test*/ ctx[0][3];
    	}

    	radio8 = new Radio({ props: radio8_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio8, 'value', radio8_value_binding));
    	radio8.$on("change", /*Radiochange*/ ctx[1]);

    	function radio9_value_binding(value) {
    		/*radio9_value_binding*/ ctx[12](value);
    	}

    	let radio9_props = {
    		label: "1",
    		$$slots: { default: [create_default_slot_43] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][4] !== void 0) {
    		radio9_props.value = /*test*/ ctx[0][4];
    	}

    	radio9 = new Radio({ props: radio9_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio9, 'value', radio9_value_binding));

    	function radio10_value_binding(value) {
    		/*radio10_value_binding*/ ctx[13](value);
    	}

    	let radio10_props = {
    		label: "2",
    		$$slots: { default: [create_default_slot_42] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][4] !== void 0) {
    		radio10_props.value = /*test*/ ctx[0][4];
    	}

    	radio10 = new Radio({ props: radio10_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio10, 'value', radio10_value_binding));

    	function radio11_value_binding(value) {
    		/*radio11_value_binding*/ ctx[14](value);
    	}

    	let radio11_props = {
    		label: "3",
    		$$slots: { default: [create_default_slot_41] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][4] !== void 0) {
    		radio11_props.value = /*test*/ ctx[0][4];
    	}

    	radio11 = new Radio({ props: radio11_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio11, 'value', radio11_value_binding));

    	function radio12_value_binding(value) {
    		/*radio12_value_binding*/ ctx[15](value);
    	}

    	let radio12_props = {
    		disabled: true,
    		label: "禁用",
    		$$slots: { default: [create_default_slot_40] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][5] !== void 0) {
    		radio12_props.value = /*test*/ ctx[0][5];
    	}

    	radio12 = new Radio({ props: radio12_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio12, 'value', radio12_value_binding));

    	function radio13_value_binding(value) {
    		/*radio13_value_binding*/ ctx[16](value);
    	}

    	let radio13_props = {
    		disabled: true,
    		label: "选中且禁用",
    		$$slots: { default: [create_default_slot_39] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][5] !== void 0) {
    		radio13_props.value = /*test*/ ctx[0][5];
    	}

    	radio13 = new Radio({ props: radio13_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio13, 'value', radio13_value_binding));

    	function radiogroup0_value_binding(value) {
    		/*radiogroup0_value_binding*/ ctx[17](value);
    	}

    	let radiogroup0_props = {
    		radiodata: [
    			{ value: '3', label: '3', text: '自动创建1' },
    			{ value: '6', label: '6', text: '自动创建2' },
    			{ value: '9', label: '9', text: '自动创建3' }
    		]
    	};

    	if (/*test*/ ctx[0][6] !== void 0) {
    		radiogroup0_props.value = /*test*/ ctx[0][6];
    	}

    	radiogroup0 = new RadioGroup({ props: radiogroup0_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup0, 'value', radiogroup0_value_binding));

    	function radiogroup1_value_binding(value) {
    		/*radiogroup1_value_binding*/ ctx[18](value);
    	}

    	let radiogroup1_props = {
    		radiodata: [
    			{ value: '3', label: '3', text: '自动创建1' },
    			{
    				value: '6',
    				label: '6',
    				text: '自动创建2',
    				disabled: true
    			},
    			{ value: '9', label: '9', text: '自动创建3' }
    		]
    	};

    	if (/*test*/ ctx[0][6] !== void 0) {
    		radiogroup1_props.value = /*test*/ ctx[0][6];
    	}

    	radiogroup1 = new RadioGroup({ props: radiogroup1_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup1, 'value', radiogroup1_value_binding));

    	function radiogroup2_value_binding(value) {
    		/*radiogroup2_value_binding*/ ctx[19](value);
    	}

    	let radiogroup2_props = { radiodata: ['3', '6', '9'] };

    	if (/*test*/ ctx[0][6] !== void 0) {
    		radiogroup2_props.value = /*test*/ ctx[0][6];
    	}

    	radiogroup2 = new RadioGroup({ props: radiogroup2_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup2, 'value', radiogroup2_value_binding));

    	function radiogroup3_value_binding(value) {
    		/*radiogroup3_value_binding*/ ctx[20](value);
    	}

    	let radiogroup3_props = {
    		$$slots: { default: [create_default_slot_35] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][6] !== void 0) {
    		radiogroup3_props.value = /*test*/ ctx[0][6];
    	}

    	radiogroup3 = new RadioGroup({ props: radiogroup3_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup3, 'value', radiogroup3_value_binding));
    	radiogroup3.$on("change", /*RadioGroupchange*/ ctx[2]);

    	function radiogroup4_value_binding(value) {
    		/*radiogroup4_value_binding*/ ctx[21](value);
    	}

    	let radiogroup4_props = {
    		size: "medium",
    		$$slots: { default: [create_default_slot_31] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][6] !== void 0) {
    		radiogroup4_props.value = /*test*/ ctx[0][6];
    	}

    	radiogroup4 = new RadioGroup({ props: radiogroup4_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup4, 'value', radiogroup4_value_binding));

    	function radiogroup5_value_binding(value) {
    		/*radiogroup5_value_binding*/ ctx[22](value);
    	}

    	let radiogroup5_props = {
    		size: "small",
    		$$slots: { default: [create_default_slot_27] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][6] !== void 0) {
    		radiogroup5_props.value = /*test*/ ctx[0][6];
    	}

    	radiogroup5 = new RadioGroup({ props: radiogroup5_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup5, 'value', radiogroup5_value_binding));

    	function radiogroup6_value_binding(value) {
    		/*radiogroup6_value_binding*/ ctx[23](value);
    	}

    	let radiogroup6_props = {
    		size: "mini",
    		$$slots: { default: [create_default_slot_23] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][6] !== void 0) {
    		radiogroup6_props.value = /*test*/ ctx[0][6];
    	}

    	radiogroup6 = new RadioGroup({ props: radiogroup6_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup6, 'value', radiogroup6_value_binding));

    	function radiogroup7_value_binding(value) {
    		/*radiogroup7_value_binding*/ ctx[24](value);
    	}

    	let radiogroup7_props = {
    		disabled: true,
    		$$slots: { default: [create_default_slot_19] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][6] !== void 0) {
    		radiogroup7_props.value = /*test*/ ctx[0][6];
    	}

    	radiogroup7 = new RadioGroup({ props: radiogroup7_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup7, 'value', radiogroup7_value_binding));

    	radiogroup8 = new RadioGroup({
    			props: {
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function radiobutton0_value_binding(value) {
    		/*radiobutton0_value_binding*/ ctx[28](value);
    	}

    	let radiobutton0_props = { label: "上海" };

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiobutton0_props.value = /*test*/ ctx[0][8];
    	}

    	radiobutton0 = new RadioButton({
    			props: radiobutton0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiobutton0, 'value', radiobutton0_value_binding));

    	function radiobutton1_value_binding(value) {
    		/*radiobutton1_value_binding*/ ctx[29](value);
    	}

    	let radiobutton1_props = { label: "北京", size: "medium" };

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiobutton1_props.value = /*test*/ ctx[0][8];
    	}

    	radiobutton1 = new RadioButton({
    			props: radiobutton1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiobutton1, 'value', radiobutton1_value_binding));

    	function radiobutton2_value_binding(value) {
    		/*radiobutton2_value_binding*/ ctx[30](value);
    	}

    	let radiobutton2_props = { label: "广州", size: "small" };

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiobutton2_props.value = /*test*/ ctx[0][8];
    	}

    	radiobutton2 = new RadioButton({
    			props: radiobutton2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiobutton2, 'value', radiobutton2_value_binding));

    	function radiobutton3_value_binding(value) {
    		/*radiobutton3_value_binding*/ ctx[31](value);
    	}

    	let radiobutton3_props = { label: "深圳", size: "mini" };

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiobutton3_props.value = /*test*/ ctx[0][8];
    	}

    	radiobutton3 = new RadioButton({
    			props: radiobutton3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiobutton3, 'value', radiobutton3_value_binding));

    	function radiogroup9_value_binding(value) {
    		/*radiogroup9_value_binding*/ ctx[32](value);
    	}

    	let radiogroup9_props = {
    		$$slots: { default: [create_default_slot_14] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiogroup9_props.value = /*test*/ ctx[0][8];
    	}

    	radiogroup9 = new RadioGroup({ props: radiogroup9_props, $$inline: true });
    	binding_callbacks.push(() => bind(radiogroup9, 'value', radiogroup9_value_binding));

    	function radiogroup10_value_binding(value) {
    		/*radiogroup10_value_binding*/ ctx[33](value);
    	}

    	let radiogroup10_props = {
    		size: "medium",
    		$$slots: { default: [create_default_slot_13] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiogroup10_props.value = /*test*/ ctx[0][8];
    	}

    	radiogroup10 = new RadioGroup({
    			props: radiogroup10_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiogroup10, 'value', radiogroup10_value_binding));

    	function radiogroup11_value_binding(value) {
    		/*radiogroup11_value_binding*/ ctx[34](value);
    	}

    	let radiogroup11_props = {
    		size: "small",
    		$$slots: { default: [create_default_slot_12] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiogroup11_props.value = /*test*/ ctx[0][8];
    	}

    	radiogroup11 = new RadioGroup({
    			props: radiogroup11_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiogroup11, 'value', radiogroup11_value_binding));

    	function radiogroup12_value_binding(value) {
    		/*radiogroup12_value_binding*/ ctx[35](value);
    	}

    	let radiogroup12_props = {
    		disabled: true,
    		size: "mini",
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiogroup12_props.value = /*test*/ ctx[0][8];
    	}

    	radiogroup12 = new RadioGroup({
    			props: radiogroup12_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiogroup12, 'value', radiogroup12_value_binding));

    	function radio14_value_binding(value) {
    		/*radio14_value_binding*/ ctx[36](value);
    	}

    	let radio14_props = {
    		label: "1",
    		border: true,
    		$$slots: { default: [create_default_slot_10] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][9] !== void 0) {
    		radio14_props.value = /*test*/ ctx[0][9];
    	}

    	radio14 = new Radio({ props: radio14_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio14, 'value', radio14_value_binding));

    	function radio15_value_binding(value) {
    		/*radio15_value_binding*/ ctx[37](value);
    	}

    	let radio15_props = {
    		label: "2",
    		border: true,
    		$$slots: { default: [create_default_slot_9] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][9] !== void 0) {
    		radio15_props.value = /*test*/ ctx[0][9];
    	}

    	radio15 = new Radio({ props: radio15_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio15, 'value', radio15_value_binding));

    	function radio16_value_binding(value) {
    		/*radio16_value_binding*/ ctx[38](value);
    	}

    	let radio16_props = {
    		label: "1",
    		border: true,
    		size: "medium",
    		$$slots: { default: [create_default_slot_8] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][10] !== void 0) {
    		radio16_props.value = /*test*/ ctx[0][10];
    	}

    	radio16 = new Radio({ props: radio16_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio16, 'value', radio16_value_binding));

    	function radio17_value_binding(value) {
    		/*radio17_value_binding*/ ctx[39](value);
    	}

    	let radio17_props = {
    		label: "2",
    		border: true,
    		size: "medium",
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][10] !== void 0) {
    		radio17_props.value = /*test*/ ctx[0][10];
    	}

    	radio17 = new Radio({ props: radio17_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio17, 'value', radio17_value_binding));

    	function radiogroup13_value_binding(value) {
    		/*radiogroup13_value_binding*/ ctx[40](value);
    	}

    	let radiogroup13_props = {
    		size: "small",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][0] !== void 0) {
    		radiogroup13_props.value = /*test*/ ctx[0][0];
    	}

    	radiogroup13 = new RadioGroup({
    			props: radiogroup13_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiogroup13, 'value', radiogroup13_value_binding));

    	function radiogroup14_value_binding(value) {
    		/*radiogroup14_value_binding*/ ctx[41](value);
    	}

    	let radiogroup14_props = {
    		size: "mini",
    		disabled: true,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][0] !== void 0) {
    		radiogroup14_props.value = /*test*/ ctx[0][0];
    	}

    	radiogroup14 = new RadioGroup({
    			props: radiogroup14_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiogroup14, 'value', radiogroup14_value_binding));

    	function radiogroup15_value_binding(value) {
    		/*radiogroup15_value_binding*/ ctx[42](value);
    	}

    	let radiogroup15_props = {
    		textcolor: "#000",
    		fill: "#333",
    		backgroundcolor: "#fff",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*test*/ ctx[0][8] !== void 0) {
    		radiogroup15_props.value = /*test*/ ctx[0][8];
    	}

    	radiogroup15 = new RadioGroup({
    			props: radiogroup15_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiogroup15, 'value', radiogroup15_value_binding));

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t0 = space();
    			create_component(radio1.$$.fragment);
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			create_component(radio2.$$.fragment);
    			t3 = space();
    			create_component(radio3.$$.fragment);
    			t4 = space();
    			hr1 = element("hr");
    			t5 = space();
    			create_component(radio4.$$.fragment);
    			t6 = space();
    			create_component(radio5.$$.fragment);
    			t7 = space();
    			hr2 = element("hr");
    			t8 = space();
    			create_component(radio6.$$.fragment);
    			t9 = space();
    			create_component(radio7.$$.fragment);
    			t10 = space();
    			create_component(radio8.$$.fragment);
    			t11 = space();
    			hr3 = element("hr");
    			t12 = space();
    			create_component(radio9.$$.fragment);
    			t13 = space();
    			create_component(radio10.$$.fragment);
    			t14 = space();
    			create_component(radio11.$$.fragment);
    			t15 = space();
    			hr4 = element("hr");
    			t16 = space();
    			create_component(radio12.$$.fragment);
    			t17 = space();
    			create_component(radio13.$$.fragment);
    			t18 = space();
    			hr5 = element("hr");
    			t19 = space();
    			create_component(radiogroup0.$$.fragment);
    			t20 = space();
    			hr6 = element("hr");
    			t21 = space();
    			create_component(radiogroup1.$$.fragment);
    			t22 = space();
    			hr7 = element("hr");
    			t23 = space();
    			create_component(radiogroup2.$$.fragment);
    			t24 = space();
    			hr8 = element("hr");
    			t25 = space();
    			create_component(radiogroup3.$$.fragment);
    			t26 = space();
    			hr9 = element("hr");
    			t27 = space();
    			create_component(radiogroup4.$$.fragment);
    			t28 = space();
    			hr10 = element("hr");
    			t29 = space();
    			create_component(radiogroup5.$$.fragment);
    			t30 = space();
    			hr11 = element("hr");
    			t31 = space();
    			create_component(radiogroup6.$$.fragment);
    			t32 = space();
    			hr12 = element("hr");
    			t33 = space();
    			create_component(radiogroup7.$$.fragment);
    			t34 = space();
    			hr13 = element("hr");
    			t35 = space();
    			create_component(radiogroup8.$$.fragment);
    			t36 = space();
    			hr14 = element("hr");
    			t37 = space();
    			create_component(radiobutton0.$$.fragment);
    			t38 = space();
    			create_component(radiobutton1.$$.fragment);
    			t39 = space();
    			create_component(radiobutton2.$$.fragment);
    			t40 = space();
    			create_component(radiobutton3.$$.fragment);
    			t41 = space();
    			hr15 = element("hr");
    			t42 = space();
    			div0 = element("div");
    			create_component(radiogroup9.$$.fragment);
    			t43 = space();
    			div1 = element("div");
    			create_component(radiogroup10.$$.fragment);
    			t44 = space();
    			div2 = element("div");
    			create_component(radiogroup11.$$.fragment);
    			t45 = space();
    			div3 = element("div");
    			create_component(radiogroup12.$$.fragment);
    			t46 = space();
    			hr16 = element("hr");
    			t47 = space();
    			div4 = element("div");
    			create_component(radio14.$$.fragment);
    			t48 = space();
    			create_component(radio15.$$.fragment);
    			t49 = space();
    			div5 = element("div");
    			create_component(radio16.$$.fragment);
    			t50 = space();
    			create_component(radio17.$$.fragment);
    			t51 = space();
    			div6 = element("div");
    			create_component(radiogroup13.$$.fragment);
    			t52 = space();
    			div7 = element("div");
    			create_component(radiogroup14.$$.fragment);
    			t53 = space();
    			br0 = element("br");
    			t54 = space();
    			br1 = element("br");
    			t55 = space();
    			create_component(radiogroup15.$$.fragment);
    			t56 = space();
    			br2 = element("br");
    			t57 = space();
    			br3 = element("br");
    			t58 = space();
    			br4 = element("br");
    			t59 = space();
    			br5 = element("br");
    			add_location(hr0, file$1, 23, 0, 489);
    			add_location(hr1, file$1, 26, 0, 627);
    			add_location(hr2, file$1, 29, 0, 789);
    			add_location(hr3, file$1, 33, 0, 1033);
    			add_location(hr4, file$1, 37, 0, 1205);
    			add_location(hr5, file$1, 40, 0, 1341);
    			add_location(hr6, file$1, 47, 0, 1528);
    			add_location(hr7, file$1, 53, 0, 1727);
    			add_location(hr8, file$1, 55, 0, 1799);
    			add_location(hr9, file$1, 62, 0, 2003);
    			add_location(hr10, file$1, 68, 0, 2204);
    			add_location(hr11, file$1, 74, 0, 2400);
    			add_location(hr12, file$1, 80, 0, 2606);
    			add_location(hr13, file$1, 86, 0, 2800);
    			add_location(hr14, file$1, 92, 0, 3007);
    			add_location(hr15, file$1, 97, 8, 3286);
    			add_location(div0, file$1, 98, 1, 3294);
    			set_style(div1, "margin-top", "20px");
    			add_location(div1, file$1, 107, 0, 3563);
    			set_style(div2, "margin-top", "20px");
    			add_location(div2, file$1, 115, 0, 3821);
    			set_style(div3, "margin-top", "20px");
    			add_location(div3, file$1, 123, 0, 4087);
    			add_location(hr16, file$1, 131, 0, 4352);
    			add_location(div4, file$1, 132, 0, 4359);
    			set_style(div5, "margin-top", "20px");
    			add_location(div5, file$1, 136, 0, 4504);
    			set_style(div6, "margin-top", "20px");
    			add_location(div6, file$1, 140, 0, 4704);
    			set_style(div7, "margin-top", "20px");
    			add_location(div7, file$1, 146, 0, 4918);
    			add_location(br0, file$1, 152, 0, 5131);
    			add_location(br1, file$1, 153, 0, 5139);
    			add_location(br2, file$1, 160, 0, 5427);
    			add_location(br3, file$1, 161, 0, 5435);
    			add_location(br4, file$1, 163, 0, 5445);
    			add_location(br5, file$1, 164, 0, 5453);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(radio1, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(radio2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(radio3, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(radio4, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(radio5, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, hr2, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(radio6, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(radio7, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(radio8, target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, hr3, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(radio9, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(radio10, target, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(radio11, target, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, hr4, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(radio12, target, anchor);
    			insert_dev(target, t17, anchor);
    			mount_component(radio13, target, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, hr5, anchor);
    			insert_dev(target, t19, anchor);
    			mount_component(radiogroup0, target, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, hr6, anchor);
    			insert_dev(target, t21, anchor);
    			mount_component(radiogroup1, target, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, hr7, anchor);
    			insert_dev(target, t23, anchor);
    			mount_component(radiogroup2, target, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, hr8, anchor);
    			insert_dev(target, t25, anchor);
    			mount_component(radiogroup3, target, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, hr9, anchor);
    			insert_dev(target, t27, anchor);
    			mount_component(radiogroup4, target, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, hr10, anchor);
    			insert_dev(target, t29, anchor);
    			mount_component(radiogroup5, target, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, hr11, anchor);
    			insert_dev(target, t31, anchor);
    			mount_component(radiogroup6, target, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, hr12, anchor);
    			insert_dev(target, t33, anchor);
    			mount_component(radiogroup7, target, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, hr13, anchor);
    			insert_dev(target, t35, anchor);
    			mount_component(radiogroup8, target, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, hr14, anchor);
    			insert_dev(target, t37, anchor);
    			mount_component(radiobutton0, target, anchor);
    			insert_dev(target, t38, anchor);
    			mount_component(radiobutton1, target, anchor);
    			insert_dev(target, t39, anchor);
    			mount_component(radiobutton2, target, anchor);
    			insert_dev(target, t40, anchor);
    			mount_component(radiobutton3, target, anchor);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, hr15, anchor);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, div0, anchor);
    			mount_component(radiogroup9, div0, null);
    			insert_dev(target, t43, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(radiogroup10, div1, null);
    			insert_dev(target, t44, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(radiogroup11, div2, null);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(radiogroup12, div3, null);
    			insert_dev(target, t46, anchor);
    			insert_dev(target, hr16, anchor);
    			insert_dev(target, t47, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(radio14, div4, null);
    			append_dev(div4, t48);
    			mount_component(radio15, div4, null);
    			insert_dev(target, t49, anchor);
    			insert_dev(target, div5, anchor);
    			mount_component(radio16, div5, null);
    			append_dev(div5, t50);
    			mount_component(radio17, div5, null);
    			insert_dev(target, t51, anchor);
    			insert_dev(target, div6, anchor);
    			mount_component(radiogroup13, div6, null);
    			insert_dev(target, t52, anchor);
    			insert_dev(target, div7, anchor);
    			mount_component(radiogroup14, div7, null);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t54, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t55, anchor);
    			mount_component(radiogroup15, target, anchor);
    			insert_dev(target, t56, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t57, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t58, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t59, anchor);
    			insert_dev(target, br5, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (!updating_value && dirty[0] & /*test*/ 1) {
    				updating_value = true;
    				radio0_changes.value = /*test*/ ctx[0][0];
    				add_flush_callback(() => updating_value = false);
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*test*/ 1) {
    				updating_value_1 = true;
    				radio1_changes.value = /*test*/ ctx[0][0];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			radio1.$set(radio1_changes);
    			const radio2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*test*/ 1) {
    				updating_value_2 = true;
    				radio2_changes.value = /*test*/ ctx[0][1];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			radio2.$set(radio2_changes);
    			const radio3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*test*/ 1) {
    				updating_value_3 = true;
    				radio3_changes.value = /*test*/ ctx[0][1];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			radio3.$set(radio3_changes);
    			const radio4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*test*/ 1) {
    				updating_value_4 = true;
    				radio4_changes.value = /*test*/ ctx[0][2];
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			radio4.$set(radio4_changes);
    			const radio5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*test*/ 1) {
    				updating_value_5 = true;
    				radio5_changes.value = /*test*/ ctx[0][2];
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			radio5.$set(radio5_changes);
    			const radio6_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio6_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_6 && dirty[0] & /*test*/ 1) {
    				updating_value_6 = true;
    				radio6_changes.value = /*test*/ ctx[0][3];
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			radio6.$set(radio6_changes);
    			const radio7_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio7_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_7 && dirty[0] & /*test*/ 1) {
    				updating_value_7 = true;
    				radio7_changes.value = /*test*/ ctx[0][3];
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			radio7.$set(radio7_changes);
    			const radio8_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio8_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_8 && dirty[0] & /*test*/ 1) {
    				updating_value_8 = true;
    				radio8_changes.value = /*test*/ ctx[0][3];
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			radio8.$set(radio8_changes);
    			const radio9_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio9_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_9 && dirty[0] & /*test*/ 1) {
    				updating_value_9 = true;
    				radio9_changes.value = /*test*/ ctx[0][4];
    				add_flush_callback(() => updating_value_9 = false);
    			}

    			radio9.$set(radio9_changes);
    			const radio10_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio10_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_10 && dirty[0] & /*test*/ 1) {
    				updating_value_10 = true;
    				radio10_changes.value = /*test*/ ctx[0][4];
    				add_flush_callback(() => updating_value_10 = false);
    			}

    			radio10.$set(radio10_changes);
    			const radio11_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio11_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_11 && dirty[0] & /*test*/ 1) {
    				updating_value_11 = true;
    				radio11_changes.value = /*test*/ ctx[0][4];
    				add_flush_callback(() => updating_value_11 = false);
    			}

    			radio11.$set(radio11_changes);
    			const radio12_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio12_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_12 && dirty[0] & /*test*/ 1) {
    				updating_value_12 = true;
    				radio12_changes.value = /*test*/ ctx[0][5];
    				add_flush_callback(() => updating_value_12 = false);
    			}

    			radio12.$set(radio12_changes);
    			const radio13_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio13_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_13 && dirty[0] & /*test*/ 1) {
    				updating_value_13 = true;
    				radio13_changes.value = /*test*/ ctx[0][5];
    				add_flush_callback(() => updating_value_13 = false);
    			}

    			radio13.$set(radio13_changes);
    			const radiogroup0_changes = {};

    			if (!updating_value_14 && dirty[0] & /*test*/ 1) {
    				updating_value_14 = true;
    				radiogroup0_changes.value = /*test*/ ctx[0][6];
    				add_flush_callback(() => updating_value_14 = false);
    			}

    			radiogroup0.$set(radiogroup0_changes);
    			const radiogroup1_changes = {};

    			if (!updating_value_15 && dirty[0] & /*test*/ 1) {
    				updating_value_15 = true;
    				radiogroup1_changes.value = /*test*/ ctx[0][6];
    				add_flush_callback(() => updating_value_15 = false);
    			}

    			radiogroup1.$set(radiogroup1_changes);
    			const radiogroup2_changes = {};

    			if (!updating_value_16 && dirty[0] & /*test*/ 1) {
    				updating_value_16 = true;
    				radiogroup2_changes.value = /*test*/ ctx[0][6];
    				add_flush_callback(() => updating_value_16 = false);
    			}

    			radiogroup2.$set(radiogroup2_changes);
    			const radiogroup3_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup3_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_17 && dirty[0] & /*test*/ 1) {
    				updating_value_17 = true;
    				radiogroup3_changes.value = /*test*/ ctx[0][6];
    				add_flush_callback(() => updating_value_17 = false);
    			}

    			radiogroup3.$set(radiogroup3_changes);
    			const radiogroup4_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup4_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_18 && dirty[0] & /*test*/ 1) {
    				updating_value_18 = true;
    				radiogroup4_changes.value = /*test*/ ctx[0][6];
    				add_flush_callback(() => updating_value_18 = false);
    			}

    			radiogroup4.$set(radiogroup4_changes);
    			const radiogroup5_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup5_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_19 && dirty[0] & /*test*/ 1) {
    				updating_value_19 = true;
    				radiogroup5_changes.value = /*test*/ ctx[0][6];
    				add_flush_callback(() => updating_value_19 = false);
    			}

    			radiogroup5.$set(radiogroup5_changes);
    			const radiogroup6_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup6_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_20 && dirty[0] & /*test*/ 1) {
    				updating_value_20 = true;
    				radiogroup6_changes.value = /*test*/ ctx[0][6];
    				add_flush_callback(() => updating_value_20 = false);
    			}

    			radiogroup6.$set(radiogroup6_changes);
    			const radiogroup7_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup7_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_21 && dirty[0] & /*test*/ 1) {
    				updating_value_21 = true;
    				radiogroup7_changes.value = /*test*/ ctx[0][6];
    				add_flush_callback(() => updating_value_21 = false);
    			}

    			radiogroup7.$set(radiogroup7_changes);
    			const radiogroup8_changes = {};

    			if (dirty[0] & /*test*/ 1 | dirty[1] & /*$$scope*/ 4096) {
    				radiogroup8_changes.$$scope = { dirty, ctx };
    			}

    			radiogroup8.$set(radiogroup8_changes);
    			const radiobutton0_changes = {};

    			if (!updating_value_22 && dirty[0] & /*test*/ 1) {
    				updating_value_22 = true;
    				radiobutton0_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_22 = false);
    			}

    			radiobutton0.$set(radiobutton0_changes);
    			const radiobutton1_changes = {};

    			if (!updating_value_23 && dirty[0] & /*test*/ 1) {
    				updating_value_23 = true;
    				radiobutton1_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_23 = false);
    			}

    			radiobutton1.$set(radiobutton1_changes);
    			const radiobutton2_changes = {};

    			if (!updating_value_24 && dirty[0] & /*test*/ 1) {
    				updating_value_24 = true;
    				radiobutton2_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_24 = false);
    			}

    			radiobutton2.$set(radiobutton2_changes);
    			const radiobutton3_changes = {};

    			if (!updating_value_25 && dirty[0] & /*test*/ 1) {
    				updating_value_25 = true;
    				radiobutton3_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_25 = false);
    			}

    			radiobutton3.$set(radiobutton3_changes);
    			const radiogroup9_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup9_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_26 && dirty[0] & /*test*/ 1) {
    				updating_value_26 = true;
    				radiogroup9_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_26 = false);
    			}

    			radiogroup9.$set(radiogroup9_changes);
    			const radiogroup10_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup10_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_27 && dirty[0] & /*test*/ 1) {
    				updating_value_27 = true;
    				radiogroup10_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_27 = false);
    			}

    			radiogroup10.$set(radiogroup10_changes);
    			const radiogroup11_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup11_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_28 && dirty[0] & /*test*/ 1) {
    				updating_value_28 = true;
    				radiogroup11_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_28 = false);
    			}

    			radiogroup11.$set(radiogroup11_changes);
    			const radiogroup12_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup12_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_29 && dirty[0] & /*test*/ 1) {
    				updating_value_29 = true;
    				radiogroup12_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_29 = false);
    			}

    			radiogroup12.$set(radiogroup12_changes);
    			const radio14_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio14_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_30 && dirty[0] & /*test*/ 1) {
    				updating_value_30 = true;
    				radio14_changes.value = /*test*/ ctx[0][9];
    				add_flush_callback(() => updating_value_30 = false);
    			}

    			radio14.$set(radio14_changes);
    			const radio15_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio15_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_31 && dirty[0] & /*test*/ 1) {
    				updating_value_31 = true;
    				radio15_changes.value = /*test*/ ctx[0][9];
    				add_flush_callback(() => updating_value_31 = false);
    			}

    			radio15.$set(radio15_changes);
    			const radio16_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio16_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_32 && dirty[0] & /*test*/ 1) {
    				updating_value_32 = true;
    				radio16_changes.value = /*test*/ ctx[0][10];
    				add_flush_callback(() => updating_value_32 = false);
    			}

    			radio16.$set(radio16_changes);
    			const radio17_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radio17_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_33 && dirty[0] & /*test*/ 1) {
    				updating_value_33 = true;
    				radio17_changes.value = /*test*/ ctx[0][10];
    				add_flush_callback(() => updating_value_33 = false);
    			}

    			radio17.$set(radio17_changes);
    			const radiogroup13_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup13_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_34 && dirty[0] & /*test*/ 1) {
    				updating_value_34 = true;
    				radiogroup13_changes.value = /*test*/ ctx[0][0];
    				add_flush_callback(() => updating_value_34 = false);
    			}

    			radiogroup13.$set(radiogroup13_changes);
    			const radiogroup14_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup14_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_35 && dirty[0] & /*test*/ 1) {
    				updating_value_35 = true;
    				radiogroup14_changes.value = /*test*/ ctx[0][0];
    				add_flush_callback(() => updating_value_35 = false);
    			}

    			radiogroup14.$set(radiogroup14_changes);
    			const radiogroup15_changes = {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				radiogroup15_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_36 && dirty[0] & /*test*/ 1) {
    				updating_value_36 = true;
    				radiogroup15_changes.value = /*test*/ ctx[0][8];
    				add_flush_callback(() => updating_value_36 = false);
    			}

    			radiogroup15.$set(radiogroup15_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			transition_in(radio2.$$.fragment, local);
    			transition_in(radio3.$$.fragment, local);
    			transition_in(radio4.$$.fragment, local);
    			transition_in(radio5.$$.fragment, local);
    			transition_in(radio6.$$.fragment, local);
    			transition_in(radio7.$$.fragment, local);
    			transition_in(radio8.$$.fragment, local);
    			transition_in(radio9.$$.fragment, local);
    			transition_in(radio10.$$.fragment, local);
    			transition_in(radio11.$$.fragment, local);
    			transition_in(radio12.$$.fragment, local);
    			transition_in(radio13.$$.fragment, local);
    			transition_in(radiogroup0.$$.fragment, local);
    			transition_in(radiogroup1.$$.fragment, local);
    			transition_in(radiogroup2.$$.fragment, local);
    			transition_in(radiogroup3.$$.fragment, local);
    			transition_in(radiogroup4.$$.fragment, local);
    			transition_in(radiogroup5.$$.fragment, local);
    			transition_in(radiogroup6.$$.fragment, local);
    			transition_in(radiogroup7.$$.fragment, local);
    			transition_in(radiogroup8.$$.fragment, local);
    			transition_in(radiobutton0.$$.fragment, local);
    			transition_in(radiobutton1.$$.fragment, local);
    			transition_in(radiobutton2.$$.fragment, local);
    			transition_in(radiobutton3.$$.fragment, local);
    			transition_in(radiogroup9.$$.fragment, local);
    			transition_in(radiogroup10.$$.fragment, local);
    			transition_in(radiogroup11.$$.fragment, local);
    			transition_in(radiogroup12.$$.fragment, local);
    			transition_in(radio14.$$.fragment, local);
    			transition_in(radio15.$$.fragment, local);
    			transition_in(radio16.$$.fragment, local);
    			transition_in(radio17.$$.fragment, local);
    			transition_in(radiogroup13.$$.fragment, local);
    			transition_in(radiogroup14.$$.fragment, local);
    			transition_in(radiogroup15.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			transition_out(radio2.$$.fragment, local);
    			transition_out(radio3.$$.fragment, local);
    			transition_out(radio4.$$.fragment, local);
    			transition_out(radio5.$$.fragment, local);
    			transition_out(radio6.$$.fragment, local);
    			transition_out(radio7.$$.fragment, local);
    			transition_out(radio8.$$.fragment, local);
    			transition_out(radio9.$$.fragment, local);
    			transition_out(radio10.$$.fragment, local);
    			transition_out(radio11.$$.fragment, local);
    			transition_out(radio12.$$.fragment, local);
    			transition_out(radio13.$$.fragment, local);
    			transition_out(radiogroup0.$$.fragment, local);
    			transition_out(radiogroup1.$$.fragment, local);
    			transition_out(radiogroup2.$$.fragment, local);
    			transition_out(radiogroup3.$$.fragment, local);
    			transition_out(radiogroup4.$$.fragment, local);
    			transition_out(radiogroup5.$$.fragment, local);
    			transition_out(radiogroup6.$$.fragment, local);
    			transition_out(radiogroup7.$$.fragment, local);
    			transition_out(radiogroup8.$$.fragment, local);
    			transition_out(radiobutton0.$$.fragment, local);
    			transition_out(radiobutton1.$$.fragment, local);
    			transition_out(radiobutton2.$$.fragment, local);
    			transition_out(radiobutton3.$$.fragment, local);
    			transition_out(radiogroup9.$$.fragment, local);
    			transition_out(radiogroup10.$$.fragment, local);
    			transition_out(radiogroup11.$$.fragment, local);
    			transition_out(radiogroup12.$$.fragment, local);
    			transition_out(radio14.$$.fragment, local);
    			transition_out(radio15.$$.fragment, local);
    			transition_out(radio16.$$.fragment, local);
    			transition_out(radio17.$$.fragment, local);
    			transition_out(radiogroup13.$$.fragment, local);
    			transition_out(radiogroup14.$$.fragment, local);
    			transition_out(radiogroup15.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(radio1, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t2);
    			destroy_component(radio2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(radio3, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t5);
    			destroy_component(radio4, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(radio5, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(hr2);
    			if (detaching) detach_dev(t8);
    			destroy_component(radio6, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(radio7, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(radio8, detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(hr3);
    			if (detaching) detach_dev(t12);
    			destroy_component(radio9, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(radio10, detaching);
    			if (detaching) detach_dev(t14);
    			destroy_component(radio11, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(hr4);
    			if (detaching) detach_dev(t16);
    			destroy_component(radio12, detaching);
    			if (detaching) detach_dev(t17);
    			destroy_component(radio13, detaching);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(hr5);
    			if (detaching) detach_dev(t19);
    			destroy_component(radiogroup0, detaching);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(hr6);
    			if (detaching) detach_dev(t21);
    			destroy_component(radiogroup1, detaching);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(hr7);
    			if (detaching) detach_dev(t23);
    			destroy_component(radiogroup2, detaching);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(hr8);
    			if (detaching) detach_dev(t25);
    			destroy_component(radiogroup3, detaching);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(hr9);
    			if (detaching) detach_dev(t27);
    			destroy_component(radiogroup4, detaching);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(hr10);
    			if (detaching) detach_dev(t29);
    			destroy_component(radiogroup5, detaching);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(hr11);
    			if (detaching) detach_dev(t31);
    			destroy_component(radiogroup6, detaching);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(hr12);
    			if (detaching) detach_dev(t33);
    			destroy_component(radiogroup7, detaching);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(hr13);
    			if (detaching) detach_dev(t35);
    			destroy_component(radiogroup8, detaching);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(hr14);
    			if (detaching) detach_dev(t37);
    			destroy_component(radiobutton0, detaching);
    			if (detaching) detach_dev(t38);
    			destroy_component(radiobutton1, detaching);
    			if (detaching) detach_dev(t39);
    			destroy_component(radiobutton2, detaching);
    			if (detaching) detach_dev(t40);
    			destroy_component(radiobutton3, detaching);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(hr15);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(div0);
    			destroy_component(radiogroup9);
    			if (detaching) detach_dev(t43);
    			if (detaching) detach_dev(div1);
    			destroy_component(radiogroup10);
    			if (detaching) detach_dev(t44);
    			if (detaching) detach_dev(div2);
    			destroy_component(radiogroup11);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(div3);
    			destroy_component(radiogroup12);
    			if (detaching) detach_dev(t46);
    			if (detaching) detach_dev(hr16);
    			if (detaching) detach_dev(t47);
    			if (detaching) detach_dev(div4);
    			destroy_component(radio14);
    			destroy_component(radio15);
    			if (detaching) detach_dev(t49);
    			if (detaching) detach_dev(div5);
    			destroy_component(radio16);
    			destroy_component(radio17);
    			if (detaching) detach_dev(t51);
    			if (detaching) detach_dev(div6);
    			destroy_component(radiogroup13);
    			if (detaching) detach_dev(t52);
    			if (detaching) detach_dev(div7);
    			destroy_component(radiogroup14);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t54);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t55);
    			destroy_component(radiogroup15, detaching);
    			if (detaching) detach_dev(t56);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t57);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t58);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t59);
    			if (detaching) detach_dev(br5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Radio', slots, []);
    	let test = ['1', '1', '1', '1', '1', '选中且禁用', '3', '3', '上海', '1', '1'];

    	const Radiochange = e => {
    		console.log(e.detail.target.value);
    	};

    	const RadioGroupchange = e => {
    		console.log(e.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Radio> was created with unknown prop '${key}'`);
    	});

    	function radio0_value_binding(value) {
    		if ($$self.$$.not_equal(test[0], value)) {
    			test[0] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio1_value_binding(value) {
    		if ($$self.$$.not_equal(test[0], value)) {
    			test[0] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio2_value_binding(value) {
    		if ($$self.$$.not_equal(test[1], value)) {
    			test[1] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio3_value_binding(value) {
    		if ($$self.$$.not_equal(test[1], value)) {
    			test[1] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio4_value_binding(value) {
    		if ($$self.$$.not_equal(test[2], value)) {
    			test[2] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio5_value_binding(value) {
    		if ($$self.$$.not_equal(test[2], value)) {
    			test[2] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio6_value_binding(value) {
    		if ($$self.$$.not_equal(test[3], value)) {
    			test[3] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio7_value_binding(value) {
    		if ($$self.$$.not_equal(test[3], value)) {
    			test[3] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio8_value_binding(value) {
    		if ($$self.$$.not_equal(test[3], value)) {
    			test[3] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio9_value_binding(value) {
    		if ($$self.$$.not_equal(test[4], value)) {
    			test[4] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio10_value_binding(value) {
    		if ($$self.$$.not_equal(test[4], value)) {
    			test[4] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio11_value_binding(value) {
    		if ($$self.$$.not_equal(test[4], value)) {
    			test[4] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio12_value_binding(value) {
    		if ($$self.$$.not_equal(test[5], value)) {
    			test[5] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio13_value_binding(value) {
    		if ($$self.$$.not_equal(test[5], value)) {
    			test[5] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup0_value_binding(value) {
    		if ($$self.$$.not_equal(test[6], value)) {
    			test[6] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup1_value_binding(value) {
    		if ($$self.$$.not_equal(test[6], value)) {
    			test[6] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup2_value_binding(value) {
    		if ($$self.$$.not_equal(test[6], value)) {
    			test[6] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup3_value_binding(value) {
    		if ($$self.$$.not_equal(test[6], value)) {
    			test[6] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup4_value_binding(value) {
    		if ($$self.$$.not_equal(test[6], value)) {
    			test[6] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup5_value_binding(value) {
    		if ($$self.$$.not_equal(test[6], value)) {
    			test[6] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup6_value_binding(value) {
    		if ($$self.$$.not_equal(test[6], value)) {
    			test[6] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup7_value_binding(value) {
    		if ($$self.$$.not_equal(test[6], value)) {
    			test[6] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio0_value_binding_1(value) {
    		if ($$self.$$.not_equal(test[7], value)) {
    			test[7] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio1_value_binding_1(value) {
    		if ($$self.$$.not_equal(test[7], value)) {
    			test[7] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio2_value_binding_1(value) {
    		if ($$self.$$.not_equal(test[7], value)) {
    			test[7] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiobutton0_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiobutton1_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiobutton2_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiobutton3_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup9_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup10_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup11_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup12_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio14_value_binding(value) {
    		if ($$self.$$.not_equal(test[9], value)) {
    			test[9] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio15_value_binding(value) {
    		if ($$self.$$.not_equal(test[9], value)) {
    			test[9] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio16_value_binding(value) {
    		if ($$self.$$.not_equal(test[10], value)) {
    			test[10] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radio17_value_binding(value) {
    		if ($$self.$$.not_equal(test[10], value)) {
    			test[10] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup13_value_binding(value) {
    		if ($$self.$$.not_equal(test[0], value)) {
    			test[0] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup14_value_binding(value) {
    		if ($$self.$$.not_equal(test[0], value)) {
    			test[0] = value;
    			$$invalidate(0, test);
    		}
    	}

    	function radiogroup15_value_binding(value) {
    		if ($$self.$$.not_equal(test[8], value)) {
    			test[8] = value;
    			$$invalidate(0, test);
    		}
    	}

    	$$self.$capture_state = () => ({
    		Radio,
    		RadioGroup,
    		RadioButton,
    		test,
    		Radiochange,
    		RadioGroupchange
    	});

    	$$self.$inject_state = $$props => {
    		if ('test' in $$props) $$invalidate(0, test = $$props.test);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		test,
    		Radiochange,
    		RadioGroupchange,
    		radio0_value_binding,
    		radio1_value_binding,
    		radio2_value_binding,
    		radio3_value_binding,
    		radio4_value_binding,
    		radio5_value_binding,
    		radio6_value_binding,
    		radio7_value_binding,
    		radio8_value_binding,
    		radio9_value_binding,
    		radio10_value_binding,
    		radio11_value_binding,
    		radio12_value_binding,
    		radio13_value_binding,
    		radiogroup0_value_binding,
    		radiogroup1_value_binding,
    		radiogroup2_value_binding,
    		radiogroup3_value_binding,
    		radiogroup4_value_binding,
    		radiogroup5_value_binding,
    		radiogroup6_value_binding,
    		radiogroup7_value_binding,
    		radio0_value_binding_1,
    		radio1_value_binding_1,
    		radio2_value_binding_1,
    		radiobutton0_value_binding,
    		radiobutton1_value_binding,
    		radiobutton2_value_binding,
    		radiobutton3_value_binding,
    		radiogroup9_value_binding,
    		radiogroup10_value_binding,
    		radiogroup11_value_binding,
    		radiogroup12_value_binding,
    		radio14_value_binding,
    		radio15_value_binding,
    		radio16_value_binding,
    		radio17_value_binding,
    		radiogroup13_value_binding,
    		radiogroup14_value_binding,
    		radiogroup15_value_binding
    	];
    }

    class Radio_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Radio_1",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\doc\Checkbox.svelte generated by Svelte v3.46.4 */
    const file = "src\\doc\\Checkbox.svelte";

    function create_fragment$1(ctx) {
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let br2;
    	let t2;
    	let br3;
    	let t3;
    	let br4;
    	let t4;
    	let br5;
    	let t5;
    	let br6;
    	let t6;
    	let br7;

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			br2 = element("br");
    			t2 = space();
    			br3 = element("br");
    			t3 = space();
    			br4 = element("br");
    			t4 = space();
    			br5 = element("br");
    			t5 = space();
    			br6 = element("br");
    			t6 = space();
    			br7 = element("br");
    			add_location(br0, file, 4, 0, 56);
    			add_location(br1, file, 5, 0, 62);
    			add_location(br2, file, 7, 0, 70);
    			add_location(br3, file, 8, 0, 76);
    			add_location(br4, file, 10, 0, 84);
    			add_location(br5, file, 11, 0, 90);
    			add_location(br6, file, 13, 0, 98);
    			add_location(br7, file, 14, 0, 104);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br7, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Checkbox', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let routes = {
    		'/checkbox': Checkbox,
    		'/radio': Radio_1,
    		'/link': Link_1,
    		'/icon': Icon_1,
    		'/container': Container_1,
    		'/row': Row_1,
    		'/button': Button_1,
    		'/': Index
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Index,
    		Button: Button_1,
    		Row: Row_1,
    		Container: Container_1,
    		Icon: Icon_1,
    		Link: Link_1,
    		Radio: Radio_1,
    		Checkbox,
    		routes
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(0, routes = $$props.routes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
