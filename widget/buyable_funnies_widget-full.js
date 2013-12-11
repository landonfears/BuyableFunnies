/*v1.0*/
(function() {
		  
/* Buyable Funnies Object */
BuyableFunnies = function() {
	/* User Widget Options */
	this.tag = ''; // Amazon ID
	this.ext = ''; // Amazon Country Code extension
	this.font = '';
	this.link_color = '#0000cc';
	
	/* Funny timestamps */
	this.current = 0;  // Current Day (0 for init)
	this.next = 0;  // Current Day (0 for init)
	this.prev = 0;  // Current Day (0 for init)
	this.start = 0; // Start Day (0 for init)
	this.end = 0; 	// End Day (0 for init)
	
	/* Scripts, styles and paths */
	this.script = 'buyable_funnies_widget.js';
	this.domain = 'http://buyablefunnies.com/';
	this.path = 'https://d30exyil9uoqwq.cloudfront.net/';
	this.css = this.path+'buyable_funnies_widget.css';
	this.ajax = this.domain+'?buyable_funnies_widget=yes';
	this.widget_title = 'Buyable Funnies';
	
	/* Save retrieved funnies */
	this.funnies = [];
	
	/* Processing status */
	this.busy = false;
	
	/* Data to show if there is an error */
	this.error = {
		url1 : 'http://amazon.com/exec/obidos/ASIN/B000UCF9TA/',
		title1 : 'NES Controller - Generic Brand',
		text1 : 'Uh oh. There\'s an error.',
		nickname1 : 'Milo the Game Controller',
		price1 : '<span class="buyablefunnies_widget_lowprice">$21.71</span> $1.00',
		img1 : 'http://ecx.images-amazon.com/images/I/41ZNu4LcPkL.jpg',
		imgw1 : '500',
		imgh1 : '340',
		imgclass1 : 'wide',
		
		url2 : 'http://amazon.com/exec/obidos/ASIN/B00GTWHM54/',
		title2 : 'Super Mario Bros. / Duck Hunt Nintendo NES Video Game Cartridge',
		text2 : 'Try blowing in me. That always works.',
		nickname2 : 'Mario the Game Cartridge',
		price2 : '$2.50',
		img2 : 'http://ecx.images-amazon.com/images/I/51VExK7Rh5L.jpg',
		imgw2 : '400',
		imgh2 : '400',
		imgclass2 : 'tall'
	}
};
BuyableFunnies.prototype = {
	bfw_cb : function(data){
		//console.dir(data);
		
		// Check this.current to see if this the 1st return call
		if(!BuyableFunniesWidget.current){
			// Set start and end timestamp
			BuyableFunniesWidget.start = data.date_start;
			BuyableFunniesWidget.end = data.date_current;
			
			// Save User Widget Options if they are	
			if(data.hasOwnProperty('aid')) BuyableFunniesWidget.tag = data.aid;
			if(data.hasOwnProperty('ext')) BuyableFunniesWidget.ext = data.ext;
			if(data.hasOwnProperty('font')) BuyableFunniesWidget.font = data.font;
			if(data.hasOwnProperty('link_color')) BuyableFunniesWidget.link_color = data.link_color;
		}
		
		// Set current, next and prev timestamps
		BuyableFunniesWidget.current = data.date_current;
		BuyableFunniesWidget.prev = data.date_prev;
		BuyableFunniesWidget.next = data.date_next;
		
		// Save funnies info in funnies object
		BuyableFunniesWidget.funnies[BuyableFunniesWidget.current] = {
			next : BuyableFunniesWidget.next,
			prev : BuyableFunniesWidget.prev,
			curr : BuyableFunniesWidget.current,
			date_format : data.date_format,
			product : data.product
		};
		
		BuyableFunniesWidget.displayHTML();
		//BuyableFunniesWidget.hideLoading();
	},
	errorContent : function(){
		// display products
		jQuery('.buyablefunnies_widget_product1').attr('href',this.error.url1);
		jQuery('.buyablefunnies_widget_product2').attr('href',this.error.url2);
		
		jQuery('.buyablefunnies_widget_product1').attr('title',this.error.title1);
		jQuery('.buyablefunnies_widget_product2').attr('title',this.error.title2);
		
		jQuery('.buyablefunnies_widget_product1 .buyablefunnies_widget_h4').text(this.error.text1);
		jQuery('.buyablefunnies_widget_product2 .buyablefunnies_widget_h4').text(this.error.text2);
		
		jQuery('.buyablefunnies_widget_product1 .buyablefunnies_widget_h5').text(this.error.nickname1);
		jQuery('.buyablefunnies_widget_product2 .buyablefunnies_widget_h5').text(this.error.nickname2);
		
		jQuery('.buyablefunnies_widget_product1 .buyablefunnies_widget_price').html(this.error.price1);
		jQuery('.buyablefunnies_widget_product2 .buyablefunnies_widget_price').html(this.error.price2);
		
		jQuery('.buyablefunnies_widget_product1 img').attr('src',this.error.img1);
		jQuery('.buyablefunnies_widget_product2 img').attr('src',this.error.img2);
		
		jQuery('.buyablefunnies_widget_product1 img').attr('alt',this.error.title1);
		jQuery('.buyablefunnies_widget_product2 img').attr('alt',this.error.title2);
		jQuery('.buyablefunnies_widget_product1 img').attr('title',this.error.title1);
		jQuery('.buyablefunnies_widget_product2 img').attr('title',this.error.title2);
		
		if(this.error.imgh1 == this.error.imgh2) jQuery('.buyablefunnies_widget_img').removeClass('buyablefunnies_widget_img_align');
		else jQuery('.buyablefunnies_widget_img').addClass('buyablefunnies_widget_img_align');
		
		jQuery('.buyablefunnies_widget_product1 img').attr('class', 'buyablefunnies_widget_'+this.error.imgclass1);
		jQuery('.buyablefunnies_widget_product2 img').attr('class', 'buyablefunnies_widget_'+this.error.imgclass2);
		
		this.finishCall();
	},
	init : function(){
		// Set CSS link in header
		var css_link = jQuery("<link>", { 
			rel: "stylesheet", 
			type: "text/css", 
			href: this.css 
		});
		css_link.appendTo('head');
		
		// Insert header, main content, and loading gif
		var init_html = '<div class="buyablefunnies_widget_header buyablefunnies_widget_clearfix">';
		init_html += '<a class="buyablefunnies_widget_logo" href="'+this.domain+'" title="'+this.widget_title+'" target="_blank"></a>';
		init_html += '<div class="buyablefunnies_widget_arrow buyablefunnies_widget_prev"><a href="#" title="Previous"></a></div>';
		init_html += '<div class="buyablefunnies_widget_date"></div>';
		init_html += '<div class="buyablefunnies_widget_arrow buyablefunnies_widget_next"><a href="#" title="Next"></a></div>';
		init_html += '</div>';
		init_html += '<div class="buyablefunnies_widget_content_wrap">';
		init_html += '<div class="buyablefunnies_widget_content buyablefunnies_widget_clearfix">';
		
		init_html += '<a class="buyablefunnies_widget_product buyablefunnies_widget_product1" href="#" title="" target="_blank">';
		init_html += '<div class="buyablefunnies_widget_h4"></div>';
    	init_html += '<div class="buyablefunnies_widget_img_wrap">';
        init_html += '<div class="buyablefunnies_widget_img"><img src="" alt="" title="" class="" /></div>';
    	init_html += '</div>';
   	 	init_html += '<div class="buyablefunnies_widget_h5"></div>';
    	init_html += '<div class="buyablefunnies_widget_price"></div>';
		init_html += '</a>';
		
		init_html += '<a class="buyablefunnies_widget_product buyablefunnies_widget_product2" href="#" title="" target="_blank">';
		init_html += '<div class="buyablefunnies_widget_h4"></div>';
    	init_html += '<div class="buyablefunnies_widget_img_wrap">';
        init_html += '<div class="buyablefunnies_widget_img"><img src="" alt="" title="" class="" /></div>';
    	init_html += '</div>';
   	 	init_html += '<div class="buyablefunnies_widget_h5"></div>';
    	init_html += '<div class="buyablefunnies_widget_price"></div>';
		init_html += '</a>';
		
		init_html += '</div>';
		init_html += '</div>';
		
		jQuery('.buyablefunnies_widget').html(init_html);

		jQuery('.buyablefunnies_widget').waitForImages(function() {
			jQuery('.buyablefunnies_widget').show();
			BuyableFunniesWidget.key = BuyableFunniesWidget.getParams(BuyableFunniesWidget.script)['key'];
			BuyableFunniesWidget.controlsEvent();
			BuyableFunniesWidget.prepareCall(0);
		});
	},
	prepareCall : function(timestamp){
		jQuery('.buyablefunnies_widget_content').fadeOut('fast', function(){
			// only call ajax if this funny doesn't exist in our object
			if(BuyableFunniesWidget.funnies.hasOwnProperty(timestamp)){
				BuyableFunniesWidget.showLoading(true);
				BuyableFunniesWidget.current = BuyableFunniesWidget.funnies[timestamp].curr;
				BuyableFunniesWidget.prev = BuyableFunniesWidget.funnies[timestamp].prev;
				BuyableFunniesWidget.next = BuyableFunniesWidget.funnies[timestamp].next;
				BuyableFunniesWidget.displayHTML();
			}
			else {
				BuyableFunniesWidget.showLoading(true);
				BuyableFunniesWidget.ajaxCall(BuyableFunniesWidget.ajax+'&key='+BuyableFunniesWidget.key+'&current='+timestamp,'BuyableFunniesWidget_CallBack',0);																  			}
		});
	},
	finishCall : function(){
		jQuery('.buyablefunnies_widget_content').waitForImages(function() {
			BuyableFunniesWidget.hideLoading(false);
			// All descendant images have loaded, now slide up.
			jQuery('.buyablefunnies_widget_content').fadeIn('fast', function(){
				BuyableFunniesWidget.busy = false;										 
			});
		});
		
	},
	hideLoading : function(set_busy){
		jQuery('.buyablefunnies_widget_content_wrap').css('background-image', 'none');	
		if(set_busy) this.busy = false;
	},
	showLoading : function(set_busy){
		jQuery('.buyablefunnies_widget_content_wrap').css('background-image', 'url('+this.path+'bf-loader.gif)');	
		if(set_busy) this.busy = true;
	},
	displayHTML : function(){
		if(this.font != ''){
			// set the user determined font
			jQuery('.buyablefunnies_widget').css('font-family',this.font);
		}
		
		// display arrow and date
		if(this.prev < this.start) jQuery('.buyablefunnies_widget_prev a').css('display','none');
		else jQuery('.buyablefunnies_widget_prev a').css('display','block');
		
		if(this.next > this.end) jQuery('.buyablefunnies_widget_next a').css('display','none');
		else jQuery('.buyablefunnies_widget_next a').css('display','block');
		
		jQuery('.buyablefunnies_widget_date').text(this.funnies[this.current].date_format);
		
		// display products
		var link1, link2;
		if(this.tag && this.ext) {
			link1 = 'http://www.amazon.'+this.ext+'/exec/obidos/ASIN/'+this.funnies[this.current].product[0].id+'/'+this.tag;
			link2 = 'http://www.amazon.'+this.ext+'/exec/obidos/ASIN/'+this.funnies[this.current].product[1].id+'/'+this.tag;
		}
		else {
			link1 = this.funnies[this.current].product[0].url;
			link2 = this.funnies[this.current].product[1].url;	
		}
		jQuery('.buyablefunnies_widget_logo').attr('href',this.funnies[this.current].product[0].url);
		jQuery('.buyablefunnies_widget_product1').attr('href',link1);
		jQuery('.buyablefunnies_widget_product2').attr('href',link2);
		
		jQuery('.buyablefunnies_widget_product1').attr('title',this.funnies[this.current].product[0].title);
		jQuery('.buyablefunnies_widget_product2').attr('title',this.funnies[this.current].product[1].title);
		
		jQuery('.buyablefunnies_widget_product1 .buyablefunnies_widget_h4').text(this.funnies[this.current].product[0].text);
		jQuery('.buyablefunnies_widget_product2 .buyablefunnies_widget_h4').text(this.funnies[this.current].product[1].text);
		
		jQuery('.buyablefunnies_widget_product1 .buyablefunnies_widget_h5').text(this.funnies[this.current].product[0].nickname);
		jQuery('.buyablefunnies_widget_product2 .buyablefunnies_widget_h5').text(this.funnies[this.current].product[1].nickname);
		
		jQuery('.buyablefunnies_widget_product1 .buyablefunnies_widget_price').html(this.funnies[this.current].product[0].price);
		jQuery('.buyablefunnies_widget_product2 .buyablefunnies_widget_price').html(this.funnies[this.current].product[1].price);
		
		jQuery('.buyablefunnies_widget_product1 img').attr('src',this.funnies[this.current].product[0].img);
		jQuery('.buyablefunnies_widget_product2 img').attr('src',this.funnies[this.current].product[1].img);
		
		jQuery('.buyablefunnies_widget_product1 img').attr('alt',this.funnies[this.current].product[0].title);
		jQuery('.buyablefunnies_widget_product2 img').attr('alt',this.funnies[this.current].product[1].title);
		jQuery('.buyablefunnies_widget_product1 img').attr('title',this.funnies[this.current].product[0].title);
		jQuery('.buyablefunnies_widget_product2 img').attr('title',this.funnies[this.current].product[1].title);
		
		if(this.funnies[this.current].product[0].imgh == this.funnies[this.current].product[1].imgh) jQuery('.buyablefunnies_widget_img').removeClass('buyablefunnies_widget_img_align');
		else jQuery('.buyablefunnies_widget_img').addClass('buyablefunnies_widget_img_align');
		
		jQuery('.buyablefunnies_widget_product1 img').attr('class', 'buyablefunnies_widget_'+this.funnies[this.current].product[0].imgclass);
		jQuery('.buyablefunnies_widget_product2 img').attr('class', 'buyablefunnies_widget_'+this.funnies[this.current].product[1].imgclass);
		
		this.finishCall();
	},
	getParams : function(script_name){
		// Find all script tags
		  var scripts = document.getElementsByTagName("script");
		  
		  // Look through them trying to find ourselves
		  for(var i=0; i<scripts.length; i++) {
			if(scripts[i].src.indexOf("/" + script_name) > -1) {
			  // Get an array of key=value strings of params
			  var pa = scripts[i].src.split("?").pop().split("&");
		
			  // Split each key=value into array, the construct js object
			  var p = {};
			  for(var j=0; j<pa.length; j++) {
				var kv = pa[j].split("=");
				p[kv[0]] = kv[1];
			  }
			  return p;
			}
		  }
		  
		  // No scripts match
		  return {};
	},
	listParams : function(){
		console.log(this.key);
	},
	controlsEvent : function(){
		//var bfw = this;
		// Previous Day
		jQuery('.buyablefunnies_widget_prev a').on('click',function(){
			if(!BuyableFunniesWidget.busy && BuyableFunniesWidget.prev >= BuyableFunniesWidget.start) BuyableFunniesWidget.prepareCall(BuyableFunniesWidget.prev);
			return false;
		});
		// Previous Day
		jQuery('.buyablefunnies_widget_next a').on('click',function(){
			if(!BuyableFunniesWidget.busy && BuyableFunniesWidget.next <= BuyableFunniesWidget.end) BuyableFunniesWidget.prepareCall(BuyableFunniesWidget.next);
			return false;
		});
		
		// Hover
		jQuery('.buyablefunnies_widget_product').hover(function(){
			jQuery(this).css('color', BuyableFunniesWidget.link_color);
		},
		function(){ jQuery(this).css('color', '#000000'); });
	},
	ajaxCall : function(url, callback, retry){
		jQuery.ajax({
			url : url,
			headers: { "cache-control": "no-cache" },
			dataType : "jsonp",
			type : 'get',
			jsonp : "callback",
			jsonpCallback: callback,
			timeout : 5000,
			error : function(xhr, status, thrown){
				//console.log('status: '+status);
				if(retry < 1) {
					BuyableFunniesWidget.ajaxCall(url, callback, retry+1);
				}
				else {
					BuyableFunniesWidget.errorContent();
				}
			},
			success : function(xhr, status, thrown){}
		});	
	}
};

var rval;
// Localize jQuery variable
var jQuery;
/******** Load jQuery if not present *********/
if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.10.2') {
	var script_tag = document.createElement('script');
	script_tag.setAttribute("type","text/javascript");
	script_tag.setAttribute("src", "http://code.jquery.com/jquery-1.10.2.min.js");
	if (script_tag.readyState) {
	  script_tag.onreadystatechange = function () { // For old versions of IE
		  if (this.readyState == 'complete' || this.readyState == 'loaded') {
			  scriptLoadHandler();
		  }
	  };
	} else { // Other browsers
	  script_tag.onload = scriptLoadHandler;
	}
	// Try to find the head, otherwise default to the documentElement
	(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
} else {
	// The jQuery version on the window is the one we want to use
	jQuery = window.jQuery;
	main();
}
function main(){
	rval = window.setInterval(bfReady, 500);
}
function scriptLoadHandler() {
	// Restore $ and window.jQuery to their previous values and store the
	// new jQuery in our local jQuery variable
	jQuery = window.jQuery.noConflict(true);
	// Call our main function
	main(); 
}
function bfReady(){
	if(jQuery('.buyablefunnies_widget').length == 1){
		window.clearInterval(rval);		
		
		

		/*! waitForImages jQuery Plugin 2013-07-20 */
		!function(a){var b="waitForImages";a.waitForImages={hasImageProperties:["backgroundImage","listStyleImage","borderImage","borderCornerImage","cursor"]},a.expr[":"].uncached=function(b){if(!a(b).is('img[src!=""]'))return!1;var c=new Image;return c.src=b.src,!c.complete},a.fn.waitForImages=function(c,d,e){var f=0,g=0;if(a.isPlainObject(arguments[0])&&(e=arguments[0].waitForAll,d=arguments[0].each,c=arguments[0].finished),c=c||a.noop,d=d||a.noop,e=!!e,!a.isFunction(c)||!a.isFunction(d))throw new TypeError("An invalid callback was supplied.");return this.each(function(){var h=a(this),i=[],j=a.waitForImages.hasImageProperties||[],k=/url\(\s*(['"]?)(.*?)\1\s*\)/g;e?h.find("*").addBack().each(function(){var b=a(this);b.is("img:uncached")&&i.push({src:b.attr("src"),element:b[0]}),a.each(j,function(a,c){var d,e=b.css(c);if(!e)return!0;for(;d=k.exec(e);)i.push({src:d[2],element:b[0]})})}):h.find("img:uncached").each(function(){i.push({src:this.src,element:this})}),f=i.length,g=0,0===f&&c.call(h[0]),a.each(i,function(e,i){var j=new Image;a(j).on("load."+b+" error."+b,function(a){return g++,d.call(i.element,g,f,"load"==a.type),g==f?(c.call(h[0]),!1):void 0}),j.src=i.src})})}}(jQuery);

		
		// Pass off the BFW object
		BuyableFunniesWidget.init();
	}
}

})(); // We call our anonymous function immediately

var BuyableFunniesWidget = new BuyableFunnies();
var BuyableFunniesWidget_CallBack = BuyableFunniesWidget.bfw_cb;
/* Function when returning data */