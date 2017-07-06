define(null, [], function (require, module, exports) {

	'use strict';
	function Editor (htmlarea, options) {
		this.options = {
			uploader : false
		}.extend(options)

		this.htmlarea = htmlarea

		this.init()
	}

	Editor.prototype = {
		init : function (options) {
			var that = this
			  , uploader = this.options.uploader
			  , placeholader = this.options.placeholader

			if ( uploader ) {
				uploader.on('preview', function (e) {
					var file = e.data.file
						file.uuid = new UUID().id
					if ( file ) {
						that.insertImage('<br>&nbsp;<span data-img=true name=' + file.uuid + ' class=img-loading loading=true></span><br>&nbsp;<br>')
					}

					// clear insertImage cur

					that.htmlarea.blur()

				}).on('complete', function (e) {
					var data = e.data,
						file = data.file,
						imgUrl = data.response.url,
						imgbox = that.htmlarea.find('[name="' + file.uuid + '"]')[0],
						image = document.createElement('img')

					image.src = imgUrl

					imgbox.attr('name', '')
						  .removeClass('img-loading')
						  .removeAttr('loading')
						  .append(image)

	        	    image.onload = function () {
	        	    	image.style.height = 'auto'
	        	    	setTimeout(function () {
	        	    		that.scrollToimage(image)
	        	    	}, 0)
	        	    }
				})
			}

			this.placeholderHandler(placeholader)
		},
		placeholderHandler: function (placeholader) {
			var that = this

			if ( placeholader ) {
				if ( !this.htmlarea.innerHTML ) {
					this.htmlarea.innerHTML = placeholader
				} else {
					that.htmlarea.addClass('active')
				}
			}

			this.htmlarea.on('focus', function () {
				if ( that.htmlarea.innerHTML === placeholader ) {
					that.htmlarea.innerHTML = '&nbsp;'
				}

				that.htmlarea.addClass('active')
			}).on('blur', function () {
				if ( !that.htmlarea.innerHTML || that.htmlarea.innerHTML == '&nbsp;' ) {
					that.htmlarea.innerHTML = placeholader
					that.htmlarea.removeClass('active')
				}
			})
		},
		scrollToimage: function (img, height) {
			var imgheight = height || img.offsetHeight
			  , scroller = this.htmlarea.previousScroller
			  , scroll

	    	if ( scroller ) {
	    		scroll = scroller.scroller
				scroll.refresh()

				scroll.scrollBy(0, Math.max(scroll.maxScrollY - scroll._y, -imgheight), 600)
			}
		},
		insertImage: function (img) {
			var that = this

			if ( this.htmlarea.innerHTML == that.options.placeholader ) {
				this.htmlarea.innerHTML = null
			}

			var insert = this.htmlarea.getSelectionRangeInsert(img)

			if ( !insert ) {
				this.htmlarea.append(img)
			}

			this.htmlarea.trigger('insertimage')
		}
	}

	module.exports = Editor
})