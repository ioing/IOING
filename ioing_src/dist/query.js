'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// 和大怨，必有余怨；报怨以德，安可以为善？

define('~/query', [], function (require, module, exports) {
    'use strict';

    module.exports = function (window) {

        var gCS = window.getComputedStyle;
        var document = window.document;
        var emptyArray = [];
        var slice = emptyArray.slice;
        var classCache = {};
        var _attrCache = {};
        var _propCache = {};
        var fragmentRE = /<(\w+)[^>]*>/;
        var classSelectorRE = /^\.([\w-]+)$/;
        var tagSelectorRE = /^[\w-]+$/;
        var rootNodeRE = /^(?:body|html)$/i;

        /**
         * This calls the $query function
         * @param {String|Element|Object|Array} selector
         * @param {String|Element|Object} [context]
         */
        var $ = function $(selector, what) {
            return new $query(selector, what);
        };

        /**
         * This is the internal appframework object that gets extended and added on to it
         * This is also the start of our query selector engine
         * @param {String|Element|Object|Array} selector
         * @param {String|Element|Object} [context]
         */
        var $query = function $query(toSelect, what) {
            this.length = 0;

            if (!toSelect) {
                return this;
            } else if ((toSelect instanceof $query || toSelect.constructor.name === '$query') && what == undefined) {
                return toSelect;
            } else if ($.isFunction(toSelect)) {
                return $(document).ready(toSelect);
            } else if ($.isArray(toSelect) && toSelect.length != undefined) {
                //Passing in an array or object
                for (var i = 0; i < toSelect.length; i++) {
                    this[this.length++] = toSelect[i];
                }return this;
            } else if ($.isObject(toSelect) && $.isObject(what)) {
                //var tmp=$("span");  $("p").find(tmp);
                if (toSelect.length == undefined) {
                    if (toSelect.parentNode == what) this[this.length++] = toSelect;
                } else {
                    for (var j = 0; j < toSelect.length; j++) {
                        if (toSelect[j].parentNode == what) this[this.length++] = toSelect[j];
                    }
                }
                return this;
            } else if ($.isObject(toSelect) && what == undefined) {
                //Single object
                this[this.length++] = toSelect;
                return this;
            } else if (what !== undefined) {
                if (what instanceof $query) {
                    return what.find(toSelect);
                }
            } else {
                what = document;
            }

            return this.selector(toSelect, what);
        };

        /**
         * internal function to use domfragments for insertion
         *
         * @api private
         */

        function _insertFragments(afm, container, insert) {
            var frag = document.createDocumentFragment();
            if (insert) {
                for (var j = afm.length - 1; j >= 0; j--) {
                    frag.insertBefore(afm[j], frag.firstChild);
                }
                container.insertBefore(frag, container.firstChild);
            } else {

                for (var k = 0; k < afm.length; k++) {
                    frag.appendChild(afm[k]);
                }
                container.appendChild(frag);
            }
            frag = null;
        }

        /**
         * Internal function to test if a class name fits in a regular expression
         * @param {String} name to search against
         * @return {Boolean}
         * @api private
         */

        function _classRE(name) {
            return name in classCache ? classCache[name] : classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
        }

        /**
         * Internal function that returns a array of _unique elements
         * @param {Array} array to compare against
         * @return {Array} array of _unique elements
         * @api private
         */

        function _unique(arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr.indexOf(arr[i]) != i) {
                    arr.splice(i, 1);
                    i--;
                }
            }
            return arr;
        }

        /**
         * Given a set of nodes, it returns them as an array.  Used to find
         * siblings of an element
         * @param {Nodelist} Node list to search
         * @param {Object} [element] to find siblings off of
         * @return {Array} array of sibblings
         * @api private
         */

        function _siblings(nodes, element) {
            var elems = [];
            if (nodes == undefined) return elems;

            for (; nodes; nodes = nodes.nextSibling) {
                if (nodes.nodeType == 1 && nodes !== element) {
                    elems.push(nodes);
                }
            }
            return elems;
        }

        /**
         * this is the engine for "all" and is only exposed internally
         * @api private
         */

        function _selectorAll(selector, what) {
            try {
                return what.querySelectorAll(selector);
            } catch (e) {
                return [];
            }
        }
        /**
         * this is the query selector engine for elements
         * @param {String} selector
         * @param {String|Element|Object} [context]
         * @api private
         */

        function _selector(selector, what) {

            selector = selector.trim();

            if (selector[0] === "#" && selector.indexOf(".") == -1 && selector.indexOf(",") == -1 && selector.indexOf(" ") === -1 && selector.indexOf(">") === -1) {
                if (what == document) _shimNodes(what.getElementById(selector.replace("#", "")), this);else _shimNodes(_selectorAll(selector, what), this);
            } else if (selector[0] === "<" && selector[selector.length - 1] === ">" || selector.indexOf("<") !== -1 && selector.indexOf(">") !== -1) //html

                {
                    var tmp = document.createElement("div");
                    tmp.innerHTML = selector.trim();
                    _shimNodes(tmp.childNodes, this);
                } else {
                _shimNodes(_selectorAll(selector, what), this);
            }
            return this;
        }

        function _shimNodes(nodes, obj) {
            if (!nodes) return;
            if (nodes.nodeType) {
                obj[obj.length++] = nodes;
                return;
            }
            for (var i = 0, iz = nodes.length; i < iz; i++) {
                obj[obj.length++] = nodes[i];
            }
        }
        /**
        * Checks to see if the parameter is a $query object
            ```
            var foo=$('#header');
            $.is$(foo);
            ```
         * @param {Object} element
        * @return {Boolean}
        * @title $.is$(param)
        */

        $.is$$ = function (obj) {
            return obj instanceof $query;
        };

        /**
        * Map takes in elements and executes a callback function on each and returns a collection
        ```
        $.map([1,2],function(ind){return ind+1});
        ```
         * @param {Array|Object} elements
        * @param {Function} callback
        * @return {Object} appframework object with elements in it
        * @title $.map(elements,callback)
        */

        $.map = function (elements, callback) {
            var value,
                values = [],
                i,
                key;
            if ($.isArray(elements)) for (i = 0; i < elements.length; i++) {
                value = callback.apply(elements[i], [i, elements[i]]);
                if (value !== undefined) values.push(value);
            } else if ($.isObject(elements)) for (key in elements) {
                if (!elements.hasOwnProperty(key) || key == "length") continue;
                value = callback(elements[key], [key, elements[key]]);
                if (value !== undefined) values.push(value);
            }
            return $(values);
        };

        /**
        * Checks to see if the parameter is an array
            ```
            var arr=[];
            $.isArray(arr);
            ```
         * @param {Object} element
        * @return {Boolean}
        * @example $.isArray([1]);
        * @title $.isArray(param)
        */

        $.isArray = function (obj) {
            return obj instanceof Array && obj.push != undefined; //ios 3.1.3 doesn't have Array.isArray
        };

        /**
        * Checks to see if the parameter is a function
            ```
            var func=function(){};
            $.isFunction(func);
            ```
         * @param {Object} element
        * @return {Boolean}
        * @title $.isFunction(param)
        */

        $.isFunction = function (obj) {
            return typeof obj === "function" && !(obj instanceof RegExp);
        };

        /*
        NEW LIEN
        */
        $.isWindow = function (obj) {
            return obj != null && obj == obj.window;
        };
        /**
        * Checks to see if the parameter is a object
            ```
            var foo={bar:'bar'};
            $.isObject(foo);
            ```
         * @param {Object} element
        * @return {Boolean}
        * @title $.isObject(param)
        */

        $.isObject = function (obj) {
            return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" && obj !== null;
        };

        /*
        NEW LIEN
        */

        $.isPlainObject = function (obj) {
            return $.isObject(obj) && !$.isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
        };

        $.isEmptyObject = function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        };

        /**
         * Prototype for afm object.  Also extens $.fn
         */

        $.fn = $query.prototype = {
            constructor: $query,
            forEach: emptyArray.forEach,
            reduce: emptyArray.reduce,
            push: emptyArray.push,
            indexOf: emptyArray.indexOf,
            concat: emptyArray.concat,
            selector: _selector,
            oldElement: undefined,
            slice: emptyArray.slice,
            length: 0,
            /**
             * This is a utility function for .end()
             * @param {Object} params
             * @return {Object} an appframework with params.oldElement set to this
             * @api private
             */
            _setupOld: function _setupOld(params) {
                if (params == undefined) return $();
                params.oldElement = this;
                return params;
            },
            /**
            * This is a wrapper to $.map on the selected elements
                ```
                $().map(function(){this.value+=ind});
                ```
             * @param {Function} callback
            * @return {Object} an appframework object
            * @title $().map(function)
            */
            map: function map(fn) {
                var value,
                    values = [],
                    i;
                for (i = 0; i < this.length; i++) {
                    value = fn.apply(this[i], [i, this[i]]);
                    if (value !== undefined) values.push(value);
                }
                return $(values);
            },
            /**
            * Iterates through all elements and applys a callback function
                ```
                $().each(function(){console.log(this.value)});
                ```
             * @param {Function} callback
            * @return {Object} an appframework object
            * @title $().each(function)
            */
            each: function each(callback) {
                this.forEach(function (el, idx) {
                    callback.call(el, idx, el);
                });
                return this;
            },
            /**
            * This is executed when DOMContentLoaded happens, or after if you've registered for it.
                ```
                $(document).ready(function(){console.log('I'm ready');});
                ```
             * @param {Function} callback
            * @return {Object} an appframework object
            * @title $().ready(function)
            */

            ready: function ready(callback) {
                var document = this[0];
                if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") callback();else document.addEventListener("DOMContentLoaded", callback, false);
                return this;
            },
            /**
            * Searches through the collection and reduces them to elements that match the selector
                ```
                $("#foo").find('.bar');
                $("#foo").find($('.bar'));
                $("#foo").find($('.bar').get(0));
                ```
             * @param {String|Object|Array} selector
            * @return {Object} an appframework object filtered
            * @title $().find(selector)
             */
            find: function find(sel) {
                if (this.length === 0) return this;
                var elems = [];
                var tmpElems;
                for (var i = 0; i < this.length; i++) {
                    tmpElems = $(sel, this[i]);

                    for (var j = 0; j < tmpElems.length; j++) {
                        elems.push(tmpElems[j]);
                    }
                }

                return $(_unique(elems));
            },
            /**
            * Gets or sets the innerHTML for the collection.
            * If used as a get, the first elements innerHTML is returned
                ```
                $("#foo").html(); //gets the first elements html
                $("#foo").html('new html');//sets the html
                $("#foo").html('new html',false); //Do not do memory management cleanup
                ```
             * @param {String} html to set
            * @param {Bool} [cleanup] - set to false for performance tests and if you do not want to execute memory management cleanup
            * @return {Object} an appframework object
            * @title $().html([html])
            */
            html: function html(_html, cleanup) {
                if (this.length === 0) return this;
                if (_html === undefined) return this[0].innerHTML;

                for (var i = 0; i < this.length; i++) {
                    if (cleanup !== false) $.cleanUpContent(this[i], false, true);
                    this[i].innerHTML = _html;
                }
                return this;
            },

            /**
            * Gets or sets the innerText for the collection.
            * If used as a get, the first elements innerText is returned
                ```
                $("#foo").text(); //gets the first elements text;
                $("#foo").text('new text'); //sets the text
                ```
             * @param {String} text to set
            * @return {Object} an appframework object
            * @title $().text([text])
            */
            text: function text(_text) {
                if (this.length === 0) return this;
                if (_text === undefined) return this[0].textContent;
                for (var i = 0; i < this.length; i++) {
                    this[i].textContent = _text;
                }
                return this;
            },
            /**
            * Gets or sets a css property for the collection
            * If used as a get, the first elements css property is returned
            * This will add px to properties that need it.
                ```
                $().css("background"); // Gets the first elements background
                $().css("background","red")  //Sets the elements background to red
                ```
             * @param {String} attribute to get
            * @param {String} value to set as
            * @return {Object} an appframework object
            * @title $().css(attribute,[value])
            */
            css: function css(attribute, value, obj) {
                var toAct = obj != undefined ? obj : this[0];
                if (this.length === 0) return this;
                if (value == undefined && typeof attribute === "string") {
                    return toAct.style[attribute] ? toAct.style[attribute] : gCS(toAct)[attribute];
                }
                for (var i = 0; i < this.length; i++) {
                    if ($.isObject(attribute)) {
                        for (var j in attribute) {
                            this[i].style.set(j, attribute[j]);
                        }
                    } else {
                        this[i].style.set(attribute, value);
                    }
                }
                return this;
            },
            /**
             * Gets the computed style of CSS values
             *
            ```
               $("#main").computedStyle('display');
            ```
             * @param {String} css property
             * @return {Int|String|Float|} css vlaue
             * @title $().computedStyle()
             */
            computedStyle: function computedStyle(val) {
                if (this.length === 0 || val == undefined) return;
                return gCS(this[0], '')[val];
            },
            /**
            * Sets the innerHTML of all elements to an empty string
                ```
                $().empty();
                ```
             * @return {Object} an appframework object
            * @title $().empty()
            */
            empty: function empty() {
                for (var i = 0; i < this.length; i++) {
                    $.cleanUpContent(this[i], false, true);
                    this[i].textContent = '';
                }
                return this;
            },
            /**
            * Sets the elements display property to "none".
            * This will also store the old property into an attribute for hide
                ```
                $().hide();
                ```
             * @return {Object} an appframework object
            * @title $().hide()
            */
            hide: function hide() {
                if (this.length === 0) return this;
                for (var i = 0; i < this.length; i++) {
                    if (this.css("display", null, this[i]) != "none") {
                        this[i].setAttribute("afmOldStyle", this.css("display", null, this[i]));
                        this[i].style.display = "none";
                    }
                }
                return this;
            },
            /**
            * Shows all the elements by setting the css display property
            * We look to see if we were retaining an old style (like table-cell) and restore that, otherwise we set it to block
                ```
                $().show();
                ```
             * @return {Object} an appframework object
            * @title $().show()
            */
            show: function show() {
                if (this.length === 0) return this;
                for (var i = 0; i < this.length; i++) {
                    if (this.css("display", null, this[i]) == "none") {
                        this[i].style.display = this[i].getAttribute("afmOldStyle") ? this[i].getAttribute("afmOldStyle") : 'block';
                        this[i].removeAttribute("afmOldStyle");
                    }
                }
                return this;
            },
            /**
            * Toggle the visibility of a div
                ```
                $().toggle();
                $().toggle(true); //force showing
                ```
             * @param {Boolean} [show] -force the hiding or showing of the element
            * @return {Object} an appframework object
            * @title $().toggle([show])
            */
            toggle: function toggle(show) {
                if (this.length === 0) return this;
                var show2 = !!(show === true);
                for (var i = 0; i < this.length; i++) {
                    if (this.css("display", null, this[i]) != "none" && (show == undefined || show2 === false)) {
                        this[i].setAttribute("afmOldStyle", this.css("display", null, this[i]));
                        this[i].style.display = "none";
                    } else if (this.css("display", null, this[i]) == "none" && (show == undefined || show2 === true)) {
                        this[i].style.display = this[i].getAttribute("afmOldStyle") ? this[i].getAttribute("afmOldStyle") : 'block';
                        this[i].removeAttribute("afmOldStyle");
                    }
                }
                return this;
            },
            /**
            * Gets or sets an elements value
            * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
                ```
                $().value; //Gets the first elements value;
                $().value="bar"; //Sets all elements value to bar
                ```
             * @param {String} [value] to set
            * @return {String|Object} A string as a getter, appframework object as a setter
            * @title $().val([value])
            */
            val: function val(value) {
                if (this.length === 0) return value === undefined ? undefined : this;
                if (value == undefined) return this[0].value;
                for (var i = 0; i < this.length; i++) {
                    this[i].value = value;
                }
                return this;
            },
            /**
            * Gets or sets an attribute on an element
            * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
                ```
                $().attr("foo"); //Gets the first elements 'foo' attribute
                $().attr("foo","bar");//Sets the elements 'foo' attribute to 'bar'
                $().attr("foo",{bar:'bar'}) //Adds the object to an internal cache
                ```
             * @param {String|Object} attribute to act upon.  If it's an object (hashmap), it will set the attributes based off the kvp.
            * @param {String|Array|Object|function} [value] to set
            * @return {String|Object|Array|Function} If used as a getter, return the attribute value.  If a setter, return an appframework object
            * @title $().attr(attribute,[value])
            */
            attr: function attr(_attr, value) {
                if (this.length === 0) return value === undefined ? undefined : this;
                if (value === undefined && !$.isObject(_attr)) {
                    var val = this[0].afmCacheId && _attrCache[this[0].afmCacheId][_attr] ? this[0].afmCacheId && _attrCache[this[0].afmCacheId][_attr] : this[0].getAttribute(_attr);
                    return val;
                }
                for (var i = 0; i < this.length; i++) {
                    if ($.isObject(_attr)) {
                        for (var key in _attr) {
                            $(this[i]).attr(key, _attr[key]);
                        }
                    } else if ($.isArray(value) || $.isObject(value) || $.isFunction(value)) {

                        if (!this[i].afmCacheId) this[i].afmCacheId = $.uuid();

                        if (!_attrCache[this[i].afmCacheId]) _attrCache[this[i].afmCacheId] = {};
                        _attrCache[this[i].afmCacheId][_attr] = value;
                    } else if (value === null) {
                        this[i].removeAttribute(_attr);
                        if (this[i].afmCacheId && _attrCache[this[i].afmCacheId][_attr]) delete _attrCache[this[i].afmCacheId][_attr];
                    } else {
                        this[i].setAttribute(_attr, value);
                    }
                }
                return this;
            },
            /**
            * Removes an attribute on the elements
                ```
                $().removeAttr("foo");
                ```
             * @param {String} attributes that can be space delimited
            * @return {Object} appframework object
            * @title $().removeAttr(attribute)
            */
            removeAttr: function removeAttr(attr) {
                var that = this;
                for (var i = 0; i < this.length; i++) {
                    attr.split(/\s+/g).forEach(function (param) {
                        that[i].removeAttribute(param);
                        if (that[i].afmCacheId && _attrCache[that[i].afmCacheId][attr]) delete _attrCache[that[i].afmCacheId][attr];
                    });
                }
                return this;
            },

            /**
            * Gets or sets a property on an element
            * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
                ```
                $().prop("foo"); //Gets the first elements 'foo' property
                $().prop("foo","bar");//Sets the elements 'foo' property to 'bar'
                $().prop("foo",{bar:'bar'}) //Adds the object to an internal cache
                ```
             * @param {String|Object} property to act upon.  If it's an object (hashmap), it will set the attributes based off the kvp.
            * @param {String|Array|Object|function} [value] to set
            * @return {String|Object|Array|Function} If used as a getter, return the property value.  If a setter, return an appframework object
            * @title $().prop(property,[value])
            */
            prop: function prop(_prop, value) {
                if (this.length === 0) return value === undefined ? undefined : this;
                if (value === undefined && !$.isObject(_prop)) {
                    var res;
                    var val = this[0].afmCacheId && _propCache[this[0].afmCacheId][_prop] ? this[0].afmCacheId && _propCache[this[0].afmCacheId][_prop] : !(res = this[0][_prop]) && _prop in this[0] ? this[0][_prop] : res;
                    return val;
                }
                for (var i = 0; i < this.length; i++) {
                    if ($.isObject(_prop)) {
                        for (var key in _prop) {
                            $(this[i]).prop(key, _prop[key]);
                        }
                    } else if ($.isArray(value) || $.isObject(value) || $.isFunction(value)) {

                        if (!this[i].afmCacheId) this[i].afmCacheId = $.uuid();

                        if (!_propCache[this[i].afmCacheId]) _propCache[this[i].afmCacheId] = {};
                        _propCache[this[i].afmCacheId][_prop] = value;
                    } else if (value === null && value !== undefined) {
                        $(this[i]).removeProp(_prop);
                    } else {
                        this[i][_prop] = value;
                    }
                }
                return this;
            },
            /**
            * Removes a property on the elements
                ```
                $().removeProp("foo");
                ```
             * @param {String} properties that can be space delimited
            * @return {Object} appframework object
            * @title $().removeProp(attribute)
            */
            removeProp: function removeProp(prop) {
                var that = this;
                for (var i = 0; i < this.length; i++) {
                    prop.split(/\s+/g).forEach(function (param) {
                        if (that[i][param]) that[i][param] = undefined;
                        if (that[i].afmCacheId && _propCache[that[i].afmCacheId][prop]) {
                            delete _propCache[that[i].afmCacheId][prop];
                        }
                    });
                }
                return this;
            },

            /**
            * Removes elements based off a selector
                ```
                $().remove();  //Remove all
                $().remove(".foo");//Remove off a string selector
                var element=$("#foo").get(0);
                $().remove(element); //Remove by an element
                $().remove($(".foo"));  //Remove by a collection
                 ```
             * @param {String|Object|Array} selector to filter against
            * @return {Object} appframework object
            * @title $().remove(selector)
            */
            remove: function remove(selector) {
                var elems = $(this).filter(selector);
                if (elems == undefined) return this;
                for (var i = 0; i < elems.length; i++) {
                    $.cleanUpContent(elems[i], true, true);
                    if (elems[i] && elems[i].parentNode) {
                        elems[i].parentNode.removeChild(elems[i]);
                    }
                }
                return this;
            },
            /**
            * Adds a css class to elements.
                ```
                $().addClass("selected");
                ```
             * @param {String} classes that are space delimited
            * @return {Object} appframework object
            * @title $().addClass(name)
            */
            addClass: function addClass(name) {
                if (name == undefined) return this;
                for (var i = 0; i < this.length; i++) {
                    var cls = this[i].className;
                    var classList = [];
                    var that = this;
                    name.split(/\s+/g).forEach(function (cname) {
                        if (!that.hasClass(cname, that[i])) classList.push(cname);
                    });

                    this[i].className += (cls ? " " : "") + classList.join(" ");
                    this[i].className = this[i].className.trim();
                }
                return this;
            },
            /**
            * Removes a css class from elements.
                ```
                $().removeClass("foo"); //single class
                $().removeClass("foo selected");//remove multiple classess
                ```
             * @param {String} classes that are space delimited
            * @return {Object} appframework object
            * @title $().removeClass(name)
            */
            removeClass: function removeClass(name) {
                if (name == undefined) return this;
                for (var i = 0; i < this.length; i++) {
                    if (name == undefined) {
                        this[i].className = '';
                        return this;
                    }
                    var classList = this[i].className;
                    //SGV LINK EVENT
                    if (_typeof(this[i].className) == "object") {
                        classList = " ";
                    }
                    name.split(/\s+/g).forEach(function (cname) {
                        classList = classList.replace(_classRE(cname), " ");
                    });
                    if (classList.length > 0) this[i].className = classList.trim();else this[i].className = "";
                }
                return this;
            },
            /**
            * Adds or removes a css class to elements.
                ```
                $().toggleClass("selected");
                ```
             * @param {String} classes that are space delimited
            * @param {Boolean} [state] force toggle to add or remove classes
            * @return {Object} appframework object
            * @title $().toggleClass(name)
            */
            toggleClass: function toggleClass(name, state) {
                if (name == undefined) return this;
                for (var i = 0; i < this.length; i++) {
                    if (typeof state != "boolean") {
                        state = this.hasClass(name, this[i]);
                    }
                    $(this[i])[state ? 'removeClass' : 'addClass'](name);
                }
                return this;
            },
            /**
            * Replaces a css class on elements.
                ```
                $().replaceClass("on", "off");
                ```
             * @param {String} classes that are space delimited
            * @param {String} classes that are space delimited
            * @return {Object} appframework object
            * @title $().replaceClass(old, new)
            */
            replaceClass: function replaceClass(name, newName) {
                if (name == undefined || newName == undefined) return this;
                for (var i = 0; i < this.length; i++) {
                    if (name == undefined) {
                        this[i].className = newName;
                        continue;
                    }
                    var classList = this[i].className;
                    name.split(/\s+/g).concat(newName.split(/\s+/g)).forEach(function (cname) {
                        classList = classList.replace(_classRE(cname), " ");
                    });
                    classList = classList.trim();
                    if (classList.length > 0) {
                        this[i].className = (classList + " " + newName).trim();
                    } else this[i].className = newName;
                }
                return this;
            },
            /**
            * Checks to see if an element has a class.
                ```
                $().hasClass('foo');
                $().hasClass('foo',element);
                ```
             * @param {String} class name to check against
            * @param {Object} [element] to check against
            * @return {Boolean}
            * @title $().hasClass(name,[element])
            */
            hasClass: function hasClass(name, element) {
                if (this.length === 0) return false;
                if (!element) element = this[0];
                return _classRE(name).test(element.className);
            },
            /**
            * Appends to the elements
            * We boil everything down to an appframework object and then loop through that.
            * If it's HTML, we create a dom element so we do not break event bindings.
            * if it's a script tag, we evaluate it.
                ```
                $().append("<div></div>"); //Creates the object from the string and appends it
                $().append($("#foo")); //Append an object;
                ```
             * @param {String|Object} Element/string to add
            * @param {Boolean} [insert] insert or append
            * @return {Object} appframework object
            * @title $().append(element,[insert])
            */
            append: function append(element, insert) {
                if (element && element.length != undefined && element.length === 0) return this;
                if ($.isArray(element) || $.isObject(element)) element = $(element);
                var i;

                for (i = 0; i < this.length; i++) {
                    if (element.length && typeof element != "string") {
                        element = $(element);
                        _insertFragments(element, this[i], insert);
                    } else {
                        var obj = fragmentRE.test(element) ? $(element) : undefined;
                        if (obj == undefined || obj.length === 0) {
                            obj = document.createTextNode(element);
                        }
                        if (obj.nodeName != undefined && obj.nodeName.toLowerCase() == "script" && (!obj.type || obj.type.toLowerCase() === 'text/javascript')) {
                            window['eval'](obj.innerHTML);
                        } else if (obj instanceof $query) {
                            _insertFragments(obj, this[i], insert);
                        } else {
                            insert != undefined ? this[i].insertBefore(obj, this[i].firstChild) : this[i].appendChild(obj);
                        }
                    }
                }
                return this;
            },
            /**
            * Appends the current collection to the selector
                ```
                $().appendTo("#foo"); //Append an object;
                ```
             * @param {String|Object} Selector to append to
            * @param {Boolean} [insert] insert or append
            * @title $().appendTo(element,[insert])
            */
            appendTo: function appendTo(selector, insert) {
                var tmp = $(selector);
                tmp.append(this);
                return this;
            },
            /**
            * Prepends the current collection to the selector
                ```
                $().prependTo("#foo"); //Prepend an object;
                ```
             * @param {String|Object} Selector to prepent to
            * @title $().prependTo(element)
            */
            prependTo: function prependTo(selector) {
                var tmp = $(selector);
                tmp.append(this, true);
                return this;
            },
            /**
            * Prepends to the elements
            * This simply calls append and sets insert to true
                ```
                $().prepend("<div></div>");//Creates the object from the string and appends it
                $().prepend($("#foo")); //Prepends an object
                ```
             * @param {String|Object} Element/string to add
            * @return {Object} appframework object
            * @title $().prepend(element)
            */
            prepend: function prepend(element) {
                return this.append(element, 1);
            },
            /**
             * Inserts collection before the target (adjacent)
                ```
                $().inBefore(af("#target"));
                ```
              * @param {String|Object} Target
             * @title $().before(target);
             */
            before: function before(nodes, after) {
                if (this.length === 0) return this;
                if (!nodes) return this;

                nodes = $(nodes);

                for (var i = 0; i < nodes.length; i++) {
                    after ? this[0].parentNode.insertBefore(nodes[i], this[0].nextSibling) : this[0].parentNode.insertBefore(nodes[i], this[0]);
                }
                return this;
            },
            /**
             * Inserts collection after the target (adjacent)
                ```
                $().inAfter(af("#target"));
                ```
             * @param {String|Object} target
             * @title $().after(target);
             */
            after: function after(nodes) {
                this.before(nodes, true);
            },
            /**
            * Returns the raw DOM element.
                ```
                $().get(0); //returns the first element
                $().get(2);// returns the third element
                ```
             * @param {Int} [index]
            * @return {Object} raw DOM element
            * @title $().get([index])
            */
            get: function get(index) {
                index = index == undefined ? 0 : index;
                if (index < 0) index += this.length;
                return this[index] ? this[index] : undefined;
            },
            position: function position() {
                if (!this.length) return this;

                var elem = this[0],

                // Get *real* offsetParent
                offsetParent = this.offsetParent(),

                // Get correct offsets
                offset = this.offset(),
                    parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

                // Subtract element margins
                // note: when an element has margin: auto the offsetLeft and marginLeft
                // are the same in Safari causing offset.left to incorrectly be 0
                offset.top -= parseFloat($(elem).css('margin-top')) || 0;
                offset.left -= parseFloat($(elem).css('margin-left')) || 0;

                // Add offsetParent borders
                parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
                parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

                // Subtract the two offsets
                return {
                    top: offset.top - parentOffset.top,
                    left: offset.left - parentOffset.left
                };
            },
            offsetParent: function offsetParent() {
                return this.map(function () {
                    var parent = this.offsetParent || document.body;
                    while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static") {
                        parent = parent.offsetParent;
                    }return parent;
                });
            },
            /**
            * Returns the offset of the element, including traversing up the tree
                ```
                $().offset();
                ```
             * @return {Object} with left, top, width and height properties
            * @title $().offset()
            */
            offset: function offset() {
                var obj;
                if (this.length === 0) return this;
                if (this[0] == window) return {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: window.innerWidth,
                    height: window.innerHeight
                };else obj = this[0].getBoundingClientRect();

                return {
                    left: obj.left + window.pageXOffset,
                    top: obj.top + window.pageYOffset,
                    right: obj.right + window.pageXOffset,
                    bottom: obj.bottom + window.pageYOffset,
                    width: obj.right - obj.left,
                    height: obj.bottom - obj.top
                };
            },
            /**
             * returns the height of the element, including padding on IE
               ```
               $().height();
               ```
             * @return {string} height
             * @title $().height()
             */
            height: function height(val) {
                if (this.length === 0) return this;
                if (val != undefined) return this.css("height", val);
                if (this[0] == this[0].window) return window.innerHeight;
                if (this[0].nodeType == this[0].DOCUMENT_NODE) return this[0].documentElement.offsetheight;else {
                    var tmpVal = this.css("height").replace("px", "");
                    if (tmpVal) return tmpVal;else return this.offset().height;
                }
            },
            /**
             * returns the width of the element, including padding on IE
               ```
               $().width();
               ```
             * @return {string} width
             * @title $().width()
             */
            width: function width(val) {
                if (this.length === 0) return this;
                if (val != undefined) return this.css("width", val);
                if (this[0] == this[0].window) return window.innerWidth;
                if (this[0].nodeType == this[0].DOCUMENT_NODE) return this[0].documentElement.offsetwidth;else {
                    var tmpVal = this.css("width").replace("px", "");
                    if (tmpVal) return tmpVal;else return this.offset().width;
                }
            },
            /**
            * Returns the parent nodes of the elements based off the selector
                ```
                $("#foo").parent('.bar');
                $("#foo").parent($('.bar'));
                $("#foo").parent($('.bar').get(0));
                ```
             * @param {String|Array|Object} [selector]
            * @return {Object} appframework object with _unique parents
            * @title $().parent(selector)
            */
            parent: function parent(selector, recursive) {
                if (this.length === 0) return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    var tmp = this[i];
                    while (tmp.parentNode && tmp.parentNode != document) {
                        elems.push(tmp.parentNode);
                        if (tmp.parentNode) tmp = tmp.parentNode;
                        if (!recursive) break;
                    }
                }
                return this._setupOld($(_unique(elems)).filter(selector));
            },
            /**
            * Returns the parents of the elements based off the selector (traversing up until html document)
                ```
                $("#foo").parents('.bar');
                $("#foo").parents($('.bar'));
                $("#foo").parents($('.bar').get(0));
                ```
             * @param {String|Array|Object} [selector]
            * @return {Object} appframework object with _unique parents
            * @title $().parents(selector)
            */
            parents: function parents(selector) {
                return this.parent(selector, true);
            },
            /**
            * Returns the child nodes of the elements based off the selector
                ```
                $("#foo").children('.bar'); //Selector
                $("#foo").children($('.bar')); //Objects
                $("#foo").children($('.bar').get(0)); //Single element
                ```
             * @param {String|Array|Object} [selector]
            * @return {Object} appframework object with _unique children
            * @title $().children(selector)
            */
            childrens: function childrens(selector) {

                if (this.length === 0) return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    elems = elems.concat(_siblings(this[i].firstChild));
                }
                return this._setupOld($(elems).filter(selector));
            },
            /**
            * Returns the siblings of the element based off the selector
                ```
                $("#foo").siblings('.bar'); //Selector
                $("#foo").siblings($('.bar')); //Objects
                $("#foo").siblings($('.bar').get(0)); //Single element
                ```
             * @param {String|Array|Object} [selector]
            * @return {Object} appframework object with _unique siblings
            * @title $().siblings(selector)
            */
            siblings: function siblings(selector) {
                if (this.length === 0) return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    if (this[i].parentNode) elems = elems.concat(_siblings(this[i].parentNode.firstChild, this[i]));
                }
                return this._setupOld($(elems).filter(selector));
            },
            /**
            * Returns the closest element based off the selector and optional context
                ```
                $("#foo").closest('.bar'); //Selector
                $("#foo").closest($('.bar')); //Objects
                $("#foo").closest($('.bar').get(0)); //Single element
                ```
             * @param {String|Array|Object} selector
            * @param {Object} [context]
            * @return {Object} Returns an appframework object with the closest element based off the selector
            * @title $().closest(selector,[context]);
            */
            closest: function closest(selector, context) {
                if (this.length === 0) return this;
                var elems = [],
                    cur = this[0];

                var start = $(selector, context);
                if (start.length === 0) return $();
                while (cur && start.indexOf(cur) == -1) {
                    cur = cur !== context && cur !== document && cur.parentNode;
                }

                if (this.native) {
                    return $(cur)[0];
                }

                return $(cur);
            },
            /**
            * Filters elements based off the selector
                ```
                $("#foo").filter('.bar'); //Selector
                $("#foo").filter($('.bar')); //Objects
                $("#foo").filter($('.bar').get(0)); //Single element
                ```
             * @param {String|Array|Object} selector
            * @return {Object} Returns an appframework object after the filter was run
            * @title $().filter(selector);
            */
            filter: function filter(selector) {
                if (this.length === 0) return this;

                if (selector == undefined) return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    var val = this[i];
                    if (val.parentNode && $(selector, val.parentNode).indexOf(val) >= 0) elems.push(val);
                }
                return this._setupOld($(_unique(elems)));
            },
            /**
            * Basically the reverse of filter.  Return all elements that do NOT match the selector
                ```
                $("#foo").not('.bar'); //Selector
                $("#foo").not($('.bar')); //Objects
                $("#foo").not($('.bar').get(0)); //Single element
                ```
             * @param {String|Array|Object} selector
            * @return {Object} Returns an appframework object after the filter was run
            * @title $().not(selector);
            */
            not: function not(selector) {
                if (this.length === 0) return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    var val = this[i];
                    if (val.parentNode && $(selector, val.parentNode).indexOf(val) == -1) elems.push(val);
                }
                return this._setupOld($(_unique(elems)));
            },
            /**
            * Gets or set data-* attribute parameters on elements (when a string)
            * When used as a getter, it's only the first element
                ```
                $().data("foo"); //Gets the data-foo attribute for the first element
                $().data("foo","bar"); //Sets the data-foo attribute for all elements
                $().data("foo",{bar:'bar'});//object as the data
                ```
             * @param {String} key
            * @param {String|Array|Object} value
            * @return {String|Object} returns the value or appframework object
            * @title $().data(key,[value]);
            */
            data: function data(key, value) {
                return this.attr('data-' + key, value);
            },
            /**
            * Rolls back the appframework elements when filters were applied
            * This can be used after .not(), .filter(), .children(), .parent()
                ```
                $().filter(".panel").end(); //This will return the collection BEFORE filter is applied
                ```
             * @return {Object} returns the previous appframework object before filter was applied
            * @title $().end();
            */
            end: function end() {
                return this.oldElement != undefined ? this.oldElement : $();
            },
            /**
            * Clones the nodes in the collection.
                ```
                $().clone();// Deep clone of all elements
                $().clone(false); //Shallow clone
                ```
             * @param {Boolean} [deep] - do a deep copy or not
            * @return {Object} appframework object of cloned nodes
            * @title $().clone();
            */
            clone: function clone(deep) {
                deep = deep === false ? false : true;
                if (this.length === 0) return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    elems.push(this[i].cloneNode(deep));
                }

                return $(elems);
            },
            /**
            * Returns the number of elements in the collection
                ```
                $().size();
                ```
             * @return {Int}
            * @title $().size();
            */
            size: function size() {
                return this.length;
            },
            /**
             * Serailizes a form into a query string
               ```
               $().serialize();
               ```
             * @return {String}
             * @title $().serialize()
             */
            serialize: function serialize() {
                if (this.length === 0) return "";
                var params = [];
                for (var i = 0; i < this.length; i++) {
                    this.slice.call(this[i].elements).forEach(function (elem) {
                        var type = elem.getAttribute("type");
                        if (elem.nodeName.toLowerCase() != "fieldset" && !elem.disabled && type != "submit" && type != "reset" && type != "button" && (type != "radio" && type != "checkbox" || elem.checked)) {

                            if (elem.getAttribute("name")) {
                                if (elem.type == "select-multiple") {
                                    for (var j = 0; j < elem.options.length; j++) {
                                        if (elem.options[j].selected) params.push(elem.getAttribute("name") + "=" + encodeURIComponent(elem.options[j].value));
                                    }
                                } else params.push(elem.getAttribute("name") + "=" + encodeURIComponent(elem.value));
                            }
                        }
                    });
                }
                return params.join("&");
            },

            /* added in 1.2 */
            /**
             * Reduce the set of elements based off index
                ```
               $().eq(index)
               ```
             * @param {Int} index - Index to filter by. If negative, it will go back from the end
             * @return {Object} appframework object
             * @title $().eq(index)
             */
            eq: function eq(ind) {
                return $(this.get(ind));
            },
            /**
             * Returns the index of the selected element in the collection
               ```
               $().index(elem)
               ```
             * @param {String|Object} element to look for.  Can be a selector or object
             * @return integer - index of selected element
             * @title $().index(elem)
             */
            index: function index(elem) {
                return elem ? this.indexOf($(elem)[0]) : this.parent().children().indexOf(this[0]);
            },
            /**
              * Returns boolean if the object is a type of the selector
              ```
              $().is(selector)
              ```
             * param {String|Object} selector to act upon
             * @return boolean
             * @title $().is(selector)
             */
            is: function is(selector) {
                return !!selector && this.filter(selector).length > 0;
            },

            /**
              * query transform to native array
             */
            toArray: function toArray() {
                var query = [];

                for (var i = 0, l = this.length; i < l; i++) {
                    query.push(this[i]);
                }

                return query;
            }

        };

        /**
        * Helper function to convert XML into  the DOM node representation
            ```
            var xmlDoc=$.parseXML("<xml><foo>bar</foo></xml>");
            ```
         * @param {String} string
        * @return {Object} DOM nodes
        * @title $.parseXML(string)
        */
        $.parseXML = function (string) {
            return new DOMParser().parseFromString(string, "text/xml");
        };

        /**
         * Utility function to create a psuedo GUID
           ```
           var id= $.uuid();
           ```
         * @title $.uuid
         */
        $.uuid = function () {
            var S4 = function S4() {
                return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
            };
            return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
        };

        /**
         * Gets the css matrix, or creates a fake one
           ```
           $.getCssMatrix(domElement)
           ```
           @returns matrix with postion
           */
        $.getCssMatrix = function (ele) {
            if ($.is$(ele)) ele = ele.get(0);

            var matrixFn = window.WebKitCSSMatrix || window.MSCSSMatrix || window.CSSMatrix;

            if (ele === undefined) {
                if (matrixFn) {
                    return new matrixFn();
                } else {
                    return {
                        a: 0,
                        b: 0,
                        c: 0,
                        d: 0,
                        e: 0,
                        f: 0
                    };
                }
            }

            var computedStyle = gCS(ele);

            var transform = computedStyle.webkitTransform || computedStyle.transform || computedStyle[device.feat.cssPrefix + 'Transform'];

            if (matrixFn) return new matrixFn(transform);else if (transform) {
                //fake css matrix
                var mat = transform.replace(/[^0-9\-.,]/g, '').split(',');
                return {
                    a: +mat[0],
                    b: +mat[1],
                    c: +mat[2],
                    d: +mat[3],
                    e: +mat[4],
                    f: +mat[5]
                };
            } else {
                return {
                    a: 0,
                    b: 0,
                    c: 0,
                    d: 0,
                    e: 0,
                    f: 0
                };
            }
        };

        /**
         * $.create - a faster alertnative to $("<div id='main'>this is some text</div>");
          ```
          $.create("div",{id:'main',innerHTML:'this is some text'});
          $.create("<div id='main'>this is some text</div>");
          ```
          * @param {String} DOM Element type or html
          * @param [{Object}] properties to apply to the element
          * @return {Object} Returns an appframework object
          * @title $.create(type,[params])
          */
        $.create = function (type, props) {
            var elem;
            var f = new $query();
            if (props || type[0] !== "<") {
                if (props.html) props.innerHTML = props.html, delete props.html;

                elem = document.createElement(type);
                for (var j in props) {
                    elem[j] = props[j];
                }
                f[f.length++] = elem;
            } else {
                elem = document.createElement("div");
                elem.innerHTML = type;
                _shimNodes(elem.childNodes, f);
            }
            return f;
        };
        /**
         * $.query  - a faster alertnative to $("div");
          ```
          $.query(".panel");
          ```
          * @param {String} selector
          * @param {Object} [context]
          * @return {Object} Returns an appframework object
          * @title $.query(selector,[context])
          */
        $.query = function (sel, what) {
            if (!sel) return new $query();
            what = what || document;
            var f = new $query();
            return f.selector(sel, what);
        };
        /**
         Zepto.js events
         @api private
         */

        //The following is modified from Zepto.js / events.js
        //We've removed depricated  events like .live and allow anonymous functions to be removed
        var handlers = {},
            _afmid = 1;
        /**
         * Gets or sets the expando property on a javascript element
         * Also increments the internal counter for elements;
         * @param {Object} element
         * @return {Int} afmid
         * @api private
         */

        function afmid(element) {
            return element._afmid || (element._afmid = _afmid++);
        }
        /**
         * Searches through a local array that keeps track of event handlers for proxying.
         * Since we listen for multiple events, we match up the event, function and selector.
         * This is used to find, execute, remove proxied event functions
         * @param {Object} element
         * @param {String} [event]
         * @param {Function} [function]
         * @param {String|Object|Array} [selector]
         * @return {Function|null} handler function or false if not found
         * @api private
         */

        function findHandlers(element, event, fn, selector) {
            event = parse(event);
            if (event.ns) var matcher = matcherFor(event.ns);
            return (handlers[afmid(element)] || []).filter(function (handler) {
                return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || handler.fn == fn || typeof handler.fn === 'function' && typeof fn === 'function' && handler.fn === fn) && (!selector || handler.sel == selector);
            });
        }
        /**
         * Splits an event name by "." to look for namespaces (e.g touch.click)
         * @param {String} event
         * @return {Object} an object with the event name and namespace
         * @api private
         */

        function parse(event) {
            var parts = ('' + event).split('.');
            return {
                e: parts[0],
                ns: parts.slice(1).sort().join(' ')
            };
        }
        /**
         * Regular expression checker for event namespace checking
         * @param {String} namespace
         * @return {Regex} regular expression
         * @api private
         */

        function matcherFor(ns) {
            return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
        }

        /**
         * Utility function that will loop through events that can be a hash or space delimited and executes the function
         * @param {String|Object} events
         * @param {Function} fn
         * @param {Iterator} [iterator]
         * @api private
         */

        function eachEvent(events, fn, iterator) {
            // if ($.isObject(events))
            //     events.each(iterator)
            // else
            //     events.split(/\s/).forEach(function(type) {
            //         iterator(type, fn)
            //     })

            events = typeof events === "string" ? events.split(/\s/) : events;

            events.each(function (i, event) {
                switch (event) {
                    case 'transitionstart':
                        this.push('webkitTransitionStart');
                        this.push('oTransitionStart');
                        this.push('MSTransitionStart');
                        this.push('animationstart');
                        this.push('webkitAnimationStart');
                        this.push('oAnimationStart');
                        this.push('MSAnimationStart');
                        break;
                    case 'transitionend':
                        this.push('webkitTransitionEnd');
                        this.push('oTransitionEnd');
                        this.push('MSTransitionEnd');
                        this.push('animationend');
                        this.push('webkitAnimationEnd');
                        this.push('oAnimationEnd');
                        this.push('MSAnimationEnd');
                        break;
                }

                iterator(event, fn);
            });
        }

        /**
         * Helper function for adding an event and creating the proxy handler function.
         * All event handlers call this to wire event listeners up.  We create proxy handlers so they can be removed then.
         * This is needed for delegate/on
         * @param {Object} element
         * @param {String|Object} events
         * @param {Function} function that will be executed when event triggers
         * @param {String|Array|Object} [selector]
         * @param {Function} [getDelegate]
         * @api private
         */

        function add(element, events, fn, selector, getDelegate) {

            var id = afmid(element),
                set = handlers[id] || (handlers[id] = []);
            eachEvent(events, fn, function (event, fn) {
                var delegate = getDelegate && getDelegate(fn, event),
                    callback = delegate || fn;
                var proxyfn = function proxyfn(event) {
                    var result = callback.apply(element, [event].concat(event.data));
                    if (result === false) event.preventDefault();
                    return result;
                };
                var handler = {}.extend(parse(event), {
                    fn: fn,
                    proxy: proxyfn,
                    sel: selector,
                    del: delegate,
                    i: set.length
                });
                set.push(handler);
                element.addEventListener(handler.e, proxyfn, false);
            });
            //element=null;
        }

        /**
         * Helper function to remove event listeners.  We look through each event and then the proxy handler array to see if it exists
         * If found, we remove the listener and the entry from the proxy array.  If no function is specified, we remove all listeners that match
         * @param {Object} element
         * @param {String|Object} events
         * @param {Function} [fn]
         * @param {String|Array|Object} [selector]
         * @api private
         */

        function remove(element, events, fn, selector) {

            var id = afmid(element);
            eachEvent(events || '', fn, function (event, fn) {
                findHandlers(element, event, fn, selector).forEach(function (handler) {
                    delete handlers[id][handler.i];
                    element.removeEventListener(handler.e, handler.proxy, false);
                });
            });
        }

        $.event = {
            add: add,
            remove: remove

            /**
            * Binds an event to each element in the collection and executes the callback
                ```
                $().bind('click',function(){console.log('I clicked '+this.id);});
                ```
             * @param {String|Object} event
            * @param {Function} callback
            * @return {Object} appframework object
            * @title $().bind(event,callback)
            */
        };$.fn.bind = function (event, callback) {
            for (var i = 0; i < this.length; i++) {
                add(this[i], event, callback);
            }
            return this;
        };
        /**
        * Unbinds an event to each element in the collection.  If a callback is passed in, we remove just that one, otherwise we remove all callbacks for those events
            ```
            $().unbind('click'); //Unbinds all click events
            $().unbind('click',myFunc); //Unbinds myFunc
            ```
         * @param {String|Object} event
        * @param {Function} [callback]
        * @return {Object} appframework object
        * @title $().unbind(event,[callback]);
        */
        $.fn.unbind = function (event, callback) {
            for (var i = 0; i < this.length; i++) {
                remove(this[i], event, callback);
            }
            return this;
        };

        /**
        * Binds an event to each element in the collection that will only execute once.  When it executes, we remove the event listener then right away so it no longer happens
            ```
            $().one('click',function(){console.log('I was clicked once');});
            ```
         * @param {String|Object} event
        * @param {Function} [callback]
        * @return appframework object
        * @title $().one(event,callback);
        */
        $.fn.one = function (event, callback) {
            return this.each(function (i, element) {
                add(this, event, callback, null, function (fn, type) {
                    return function () {
                        remove(element, type, fn);
                        if (!fn) return;
                        var result = fn.apply(element, arguments);
                        return result;
                    };
                });
            });
        };

        /**
         * internal variables
         * @api private
         */

        var returnTrue = function returnTrue() {
            return true;
        };
        var returnFalse = function returnFalse() {
            return false;
        };
        var eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
            /**
             * Creates a proxy function for event handlers.
             * As "some" browsers dont support event.stopPropagation this call is bypassed if it cant be found on the event object.
             * @param {String} event
             * @return {Function} proxy
             * @api private
             */

        };function createProxy(event) {
            var proxy = {}.extend({
                originalEvent: event
            }, event);
            eventMethods.each(function (name, predicate) {
                proxy[name] = function () {
                    this[predicate] = returnTrue;
                    if (name == "stopImmediatePropagation" || name == "stopPropagation") {
                        event.cancelBubble = true;
                        if (!event[name]) return;
                    }
                    return event[name].apply(event, arguments);
                };
                proxy[predicate] = returnFalse;
            });
            return proxy;
        }

        /**
        * Delegate an event based off the selector.  The event will be registered at the parent level, but executes on the selector.
            ```
            $("#div").delegate("p",'click',callback);
            ```
         * @param {String|Array|Object} selector
        * @param {String|Object} event
        * @param {Function} callback
        * @return {Object} appframework object
        * @title $().delegate(selector,event,callback)
        */
        function addDelegate(element, event, callback, selector) {
            add(element, event, callback, selector, function (fn) {
                return function (e) {
                    var evt,
                        match = $(e.target).closest(selector, element).get(0);
                    if (match) {
                        evt = {}.extend(createProxy(e), {
                            currentTarget: match,
                            liveFired: element
                        });
                        return fn.apply(match, [evt].concat([].slice.call(arguments, 1)));
                    }
                };
            });
        }
        $.fn.delegate = function (selector, event, callback) {

            for (var i = 0; i < this.length; i++) {
                addDelegate(this[i], event, callback, selector);
            }
            return this;
        };

        /**
        * Unbinds events that were registered through delegate.  It acts upon the selector and event.  If a callback is specified, it will remove that one, otherwise it removes all of them.
            ```
            $("#div").undelegate("p",'click',callback);//Undelegates callback for the click event
            $("#div").undelegate("p",'click');//Undelegates all click events
            ```
         * @param {String|Array|Object} selector
        * @param {String|Object} event
        * @param {Function} callback
        * @return {Object} appframework object
        * @title $().undelegate(selector,event,[callback]);
        */
        $.fn.undelegate = function (selector, event, callback) {
            for (var i = 0; i < this.length; i++) {
                remove(this[i], event, callback, selector);
            }
            return this;
        };

        /**
        * Similar to delegate, but the function parameter order is easier to understand.
        * If selector is undefined or a function, we just call .bind, otherwise we use .delegate
            ```
            $("#div").on("click","p",callback);
            ```
         * @param {String|Array|Object} selector
        * @param {String|Object} event
        * @param {Function} callback
        * @return {Object} appframework object
        * @title $().on(event,selector,callback);
        */
        $.fn.on = function (event, selector, callback) {
            return selector === undefined || $.isFunction(selector) ? this.bind(event, selector) : this.delegate(selector, event, callback);
        };
        /**
        * Removes event listeners for .on()
        * If selector is undefined or a function, we call unbind, otherwise it's undelegate
            ```
            $().off("click","p",callback); //Remove callback function for click events
            $().off("click","p") //Remove all click events
            ```
         * @param {String|Object} event
        * @param {String|Array|Object} selector
        * @param {Sunction} callback
        * @return {Object} appframework object
        * @title $().off(event,selector,[callback])
        */
        $.fn.off = function (event, selector, callback) {
            return selector === undefined || $.isFunction(selector) ? this.unbind(event, selector) : this.undelegate(selector, event, callback);
        };

        /**
        This triggers an event to be dispatched.  Usefull for emulating events, etc.
        ```
        $().trigger("click",{foo:'bar'});//Trigger the click event and pass in data
        ```
         * @param {String|Object} event
        * @param {Object} [data]
        * @return {Object} appframework object
        * @title $().trigger(event,data);
        */
        $.fn.trigger = function (event, data, props) {
            if (typeof event == 'string') event = $.Event(event, props);
            event.data = data;
            for (var i = 0; i < this.length; i++) {
                this[i].dispatchEvent(event);
            }
            return this;
        };

        /**
         * Creates a custom event to be used internally.
         * @param {String} type
         * @param {Object} [properties]
         * @return {event} a custom event that can then be dispatched
         * @title $.Event(type,props);
         */

        $.Event = function (type, props) {
            var event = document.createEvent('Events'),
                bubbles = true;
            if (props) for (var name in props) {
                name == 'bubbles' ? bubbles = !!props[name] : event[name] = props[name];
            }event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null);
            return event;
        };

        /* The following are for events on objects */
        /**
         * Bind an event to an object instead of a DOM Node
           ```
           $.bind(this,'event',function(){});
           ```
         * @param {Object} object
         * @param {String} event name
         * @param {Function} function to execute
         * @title $.bind(object,event,function);
         */
        $.bind = function (obj, ev, f) {
            if (!obj) return;
            if (!obj.__events) obj.__events = {};
            if (!$.isArray(ev)) ev = [ev];
            for (var i = 0; i < ev.length; i++) {
                if (!obj.__events[ev[i]]) obj.__events[ev[i]] = [];
                obj.__events[ev[i]].push(f);
            }
        };

        /**
         * Trigger an event to an object instead of a DOM Node
           ```
           $.trigger(this,'event',arguments);
           ```
         * @param {Object} object
         * @param {String} event name
         * @param {Array} arguments
         * @title $.trigger(object,event,argments);
         */
        $.trigger = function (obj, ev, args) {
            if (!obj) return;
            var ret = true;
            if (!obj.__events) return ret;
            if (!$.isArray(ev)) ev = [ev];
            if (!$.isArray(args)) args = [];
            for (var i = 0; i < ev.length; i++) {
                if (obj.__events[ev[i]]) {
                    var evts = obj.__events[ev[i]].slice(0);
                    for (var j = 0; j < evts.length; j++) {
                        if ($.isFunction(evts[j]) && evts[j].apply(obj, args) === false) ret = false;
                    }
                }
            }
            return ret;
        };
        /**
         * Unbind an event to an object instead of a DOM Node
           ```
           $.unbind(this,'event',function(){});
           ```
         * @param {Object} object
         * @param {String} event name
         * @param {Function} function to execute
         * @title $.unbind(object,event,function);
         */
        $.unbind = function (obj, ev, f) {
            if (!obj.__events) return;
            if (!$.isArray(ev)) ev = [ev];
            for (var i = 0; i < ev.length; i++) {
                if (obj.__events[ev[i]]) {
                    var evts = obj.__events[ev[i]];
                    for (var j = 0; j < evts.length; j++) {
                        if (f == undefined) delete evts[j];
                        if (evts[j] == f) {
                            evts.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        };

        /**
         * Creates a proxy function so you can change the 'this' context in the function
         * Update: now also allows multiple argument call or for you to pass your own arguments
           ```
            var newObj={foo:bar}
            $("#main").bind("click",$.proxy(function(evt){console.log(this)},newObj);
             or
             ( $.proxy(function(foo, bar){console.log(this+foo+bar)}, newObj) )('foo', 'bar');
             or
             ( $.proxy(function(foo, bar){console.log(this+foo+bar)}, newObj, ['foo', 'bar']) )();
           ```
         * @param {Function} Callback
         * @param {Object} Context
         * @title $.proxy(callback,context);
         */
        $.proxy = function (f, c, args) {
            return function () {
                if (args) return f.apply(c, args); //use provided arguments
                return f.apply(c, arguments); //use scope function call arguments
            };
        };

        /**
         * Removes listeners on a div and its children recursively
            ```
             cleanUpNode(node,kill)
            ```
         * @param {HTMLDivElement} the element to clean up recursively
         * @api private
         */

        function cleanUpNode(node, kill) {
            //kill it before it lays eggs!
            if (kill && node.dispatchEvent) {
                var e = $.Event('destroy', {
                    bubbles: false
                });
                node.dispatchEvent(e);
            }
            //cleanup itself
            var id = afmid(node);
            if (id && handlers[id]) {
                for (var key in handlers[id]) {
                    node.removeEventListener(handlers[id][key].e, handlers[id][key].proxy, false);
                }delete handlers[id];
            }
        }

        function cleanUpContent(node, kill) {
            if (!node) return;
            //cleanup children
            var children = node.childNodes;
            if (children && children.length > 0) {
                for (var i; i < children.length; i++) {
                    cleanUpContent(children[i], kill);
                }
            }

            cleanUpNode(node, kill);
        }
        var cleanUpAsap = function cleanUpAsap(els, kill) {
            for (var i = 0; i < els.length; i++) {
                cleanUpContent(els[i], kill);
            }
        };

        /**
         * Function to clean up node content to prevent memory leaks
           ```
           $.cleanUpContent(node,itself,kill)
           ```
         * @param {HTMLNode} node
         * @param {Bool} kill itself
         * @param {bool} Kill nodes
         * @title $.cleanUpContent(node,itself,kill)
         */
        $.cleanUpContent = function (node, itself, kill) {
            if (!node) return;
            //cleanup children
            var cn = node.childNodes;
            if (cn && cn.length > 0) {
                //destroy everything in a few ms to avoid memory leaks
                //remove them all and copy objs into new array
                $.asap(cleanUpAsap, {}, [slice.apply(cn, [0]), kill]);
            }
            //cleanUp this node
            if (itself) cleanUpNode(node, kill);
        };

        // Like setTimeout(fn, 0); but much faster
        var timeouts = [];
        var contexts = [];
        var params = [];
        /**
         * This adds a command to execute in the JS stack, but is faster then setTimeout
           ```
           $.asap(function,context,args)
           ```
         * @param {Function} function
         * @param {Object} context
         * @param {Array} arguments
         */
        $.asap = function (fn, context, args) {
            if (!$.isFunction(fn)) throw "$.asap - argument is not a valid function";
            timeouts.push(fn);
            contexts.push(context ? context : {});
            params.push(args ? args : []);
            //post a message to ourselves so we know we have to execute a function from the stack
            window.postMessage("afm-asap", "*");
        };
        window.addEventListener("message", function (event) {
            if (event.source == window && event.data == "afm-asap") {
                event.stopPropagation();
                if (timeouts.length > 0) {
                    //just in case...
                    timeouts.shift().apply(contexts.shift(), params.shift());
                }
            }
        }, true);

        /**
        //custom events since people want to do $().click instead of $().bind("click")
        */

        !["click", "keydown", "keyup", "keypress", "submit", "load", "resize", "change", "select", "error"].forEach(function (event) {
            $.fn[event] = function (cb) {
                return cb ? this.bind(event, cb) : this.trigger(event);
            };
        });

        // only $query

        !['focus', 'blur'].forEach(function (name) {
            $.fn[name] = function (callback) {
                if (this.length === 0) return;
                if (callback) this.bind(name, callback);else for (var i = 0; i < this.length; i++) {
                    try {
                        this[i][name]();
                    } catch (e) {}
                }
                return this;
            };
        });

        /**
         * End of APIS
         * @api private
         */
        return $;
    };
});