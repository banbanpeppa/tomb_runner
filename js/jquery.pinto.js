/*!
  Pinto jQuery Plugin
  @name jquery.pinto.js
  @description Lightweight and customizable jQuery plugin for creating pinterest like responsive grid layout
  @author Max Lawrence 
  @version 1.2.0
  @category jQuery plugin
  @copyright (c) 2015 Max Lawrence (http://www.avirtum.com)
  @license Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/
(function($) {
    "use strict";
    
    function Pinto(config) {
        this.init(config);
    };
    
    Pinto.prototype = {
        //=============================================
        // Public Section
        //=============================================
        /**
         * Block identificator (selector)
         * @public
         * @type {string}
         */
        itemSelector: "> div",
        
        /**
         * Width of one grid block in pixels
         * @public
         * @type {number}
         */
        itemWidth: 220,
        
        /**
         * Width spacing between blocks in pixels;
         * @public
         * @type {number}
         */
        gapX: 10,
        
        /**
         * Height spacing between blocks in pixels;
         * @public
         * @type {number}
         */
        gapY: 10,
        
        /**
         * Blocks alignment - "left", "right" or "center"
         * @public
         * @type {string}
         */
        align: "left",
        
        /**
         * Adjusts block width to create optimal layout based on container size
         * @public
         * @type {boolean}
         */
        fitWidth: true,
        
        /**
         * Updates layout after browser is resized
         * @public
         * @type {boolean}
         */
        autoResize: true,
        
        /**
         * Time in milliseconds between browser resize and layout update
         * @public
         * @type {number}
         */
        resizeDelay: 50,
        
        /**
         * Fire after item layout complete
         * @public
         * @type {function}
         * @param {object} - jQuery item object
         * @param {number} - column number
         * @param {number} - item position inside the column
         */
         onItemLayout: function($item, column, position) {},
        
        //=============================================
        // Protected Section
        //=============================================
        /**
         * @protected
         */
        constructor: Pinto,
        
        /**
         * Container element. Should be passed into constructor config
         * @protected
         * @type {object}
         */
        el: null,
        
        /**
         * Resize Event
         * @protected
         * @type {object}
         */
         resizeEvent: null,
        
        /**
         * Resize timer
         * @protected
         * @type {object}
         */
        resizeTimer: null,
         
        /**
         * Init/reinit the widget
         * @param {object}
         */
        init: function(config) {
            this.clearWidget();
            $.extend(this, config);
            this.initWidget();
            this.layout();
        },
        
        /**
         * Remove events and callbacks
         * @protected
         */
        clearWidget: function() {
            if(this.resizeEvent) {
                this.resizeEvent.unbind();
                this.resizeEvent = null;
            }
            clearTimeout(this.resizeTimer);
        },
        
        /**
         * @protected
         */
        initWidget: function() {
            if (this.el.length == 0) {
                return;
            }
            
            if (this.el.css("position") != "relative") {
                this.el.css("position", "relative");
            }
            
            if (this.autoResize) {
                this.resizeEvent =  $(window).on("resize", $.proxy(this.resize, this));
                this.el.on("remove", this.resizeEvent.unbind);
            }
        },
        
        /**
         * @protected
         */
        getSmallestIndex: function (a) {
            var index = 0;
            for (var i = 1, len = a.length; i < len; i++) {
                if (a[i] < a[index]) index = i;
            }
            return index;
        },
        
        /**
         * @protected
         */
        layout: function () {
            if (this.el.length == 0 || !this.el.is(":visible")) { 
                return;
            }
            
            var self = this,
            items = this.el.find(this.itemSelector),
            width = this.el.innerWidth(),
            itemWidth = this.itemWidth,
            gapX = parseInt(this.gapX || 0),
            gapY = parseInt(this.gapY || 0),
            offset = 0,
            colsCount = 0;
            
            while(width > offset) {
                offset += itemWidth;
                if(width >= offset) {
                    colsCount++;
                } else {
                    break;
                }
                offset += gapX;
            };
            colsCount = Math.max(colsCount, 1);
            
            var cols = [], 
            colsH = [],
            i = colsCount;
            while(i--) { 
                cols.push(0);
                colsH.push(0);
            }
            
            offset = 0;
            var gap = (colsCount-1) * gapX;
            if (this.fitWidth) {
                itemWidth += Math.floor(0.5 + (width - gap - colsCount * itemWidth) / colsCount);
            } else {
                // calculate the offset based on the alignment of columns to the parent container
                if (this.align === "center") {
                    offset += Math.floor(0.5 + (width - gap - colsCount * itemWidth) >> 1);
                } else if (this.align === "right") {
                    offset += Math.floor(0.5 + (width - gap - colsCount * itemWidth));
                };
            };
            
            items.each(function(index, item) {
                var $item = $(item),
                i = self.getSmallestIndex(colsH);
                
                if (!$item.is(":visible")) {
                    return;
                }
                
                $item.css({
                    position: "absolute",
                    top: colsH[i] + "px",
                    left: (itemWidth + gapX) * i + offset + "px",
                    width: itemWidth - ($item.outerWidth() - $item.width()) // control padding and border
                });
                
                colsH[i] += $item.outerHeight() + gapY;
                
                 if (typeof self.onItemLayout == "function") { // make sure the callback is a function
                    self.onItemLayout.call(self, $item, i, cols[i]); // brings the scope to the callback
                }
                
                cols[i]++;
            });
            
            var height=0;
            i = colsCount;
            while(i--) if(colsH[i]>height) height = colsH[i];
            this.el.css({height:height});
        },
        
        /**
         * @protected
         */
         resize: function() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout($.proxy(this.layout, this), this.resizeDelay);
         },
         
        /**
         * @protected
         */
        destroy: function () {
            this.clearWidget();
            this.el.removeData("pinto");
            
            // remove dynamic styles
            var items = this.el.find(this.itemSelector);
            items.each(function() {
                var $item = $(this);
                $item.css({
                    position: "",
                    top: "",
                    left: "",
                    width: "",
                });
            });
            
            this.el.css({
                position: "",
                height: ""
            });
        }
    }
    
    //=============================================
    // Init jQuery Plugin
    //=============================================
    $.pinto = {
        // Default options (you may override them)
        defaults: Pinto.prototype
    };
    
    /**
     * @param CfgOrCmd - config object or command name
     *     you may set any public property (see above);
     *     you may use .pinto("layout") to call the layout function
     * @param CmdArgs - some commands may require an argument
     */
    $.fn.pinto = function(CfgOrCmd, CmdArgs) {
        var dataName = "pinto",
        instance = this.data(dataName);
        
        if (CfgOrCmd == "layout") {
            if (!instance) {
                throw Error("Calling 'layout' method on not initialized instance is forbidden");
            }
            
            return instance.layout();
        }
        
        if (CfgOrCmd == "destroy") {
            if (!instance) {
                throw Error("Calling 'destroy' method on not initialized instance is forbidden");
            }
            
            return instance.destroy();
        }
        
        return this.each(function() {
            var el = $(this),
            instance = el.data(dataName),
            config = $.isPlainObject(CfgOrCmd) ? CfgOrCmd : {};

            if (instance) {
                instance.init(config);
            } else {
                var initialConfig = $.extend({}, el.data());
                
                config = $.extend(initialConfig, config);
                config.el = el;
                instance = new Pinto(config);
                el.data(dataName, instance);
            }
        });
    }
})(window.jQuery);