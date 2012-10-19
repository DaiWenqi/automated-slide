/**
 * 自动化焦点图
 * 使用方法：
 * window.onload = function() {
 * 	slide.init({
 * 		width: 560,				// 焦点图宽度（非必须，默认值自适应）
 * 		height: 250,			// 焦点图高度（非必须，默认值自适应）
 * 		auto: false,			// 是否自动切换（非必须，默认值 false）
 * 		interval: 3000,			// 切换间隔时间（非必须，默认值 3000，当 auto 为 true 时有效）
 *		targetId: 'slide',		// html 对应的焦点图 ID（必须）
 * 		data: [					// 焦点图数据（必须）
 *			{
 *				src: '',		// 图片地址
 *				title: '',		// 图片标题
 *				url: ''			// 图片链接
 *			}
 *		]
 * 	});
 * }
 * @version v1.1
 * @author 万戈
 * @url http://wange.im/
**/
var slide = (function() {
	var doc = document;
	/**
	 * 配置
	**/
	var config = {
		imgData: [],					// 初使化图片信息
		imgTargetId: '',				// 初使化 Slide 目标 ID
		imgWidth: '100%',				// 初使化图片宽度
		imgHeight: '100%',				// 初使化图片高度
		imgAuto: false,					// 初使化自动播放
		imgInterval: 3000,				// 初使化间隔时间
		imgDataLen: 0,					// 初使化图片数量
		goSwitch: true,					// 鼠标悬停时切换状态
		index: 0						// 焦点所在索引值
	};
	
	/**
	 * 获取索引值，工具类
	 * @param {Element} current 当前元素
	 * @param {Object} obj 元素集合
	**/
	var getIndex = function(current, obj) {
		for (var i=0; i<obj.length; i++) {
			if (obj[i] == current) {
				return i;
			}
		}
	};

	/**
	 * 获取兄弟元素，工具类，参照 jQuery 的写法
	 * @param {Element} el 目标元素
	**/
	var siblings = function(el) {
		var r = [],
			n = el.parentNode.firstChild;
		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== el ) {
				r.push( n );
			}
		}
		return r;
	};
	
	/**
	 * 设置 Slide 宽高
	 * @param {Element} el Slide 元素
	 * @param {Number} width Slide 宽度
	 * @param {Number} height Slide 高度
	**/
	var setSlideWH = function(el, width, height) {
		var styleW,
			styleH;
		if (width == '100%') {		// 自适应宽度
			styleW = '100%';
		} else {					// 定宽
			styleW = width + 'px';
		}
		
		if (height == '100%') {		// 自适应高度
			styleH = '100%';
		} else {					// 定高
			styleH = height + 'px';
		}
		
		el.style.width = styleW;
		el.style.height = styleH;
	};
	
	/**
	 * 显示效果
	**/
	var display = {
		/**
		 * 显示元素
		 * @param {Element} target 目标元素
		**/
		show: function(target) {
			target.style.display = 'block';
		},
		/**
		 * 隐藏元素
		 * @param {Element} target 目标元素
		**/
		hide: function(target) {
			target.style.display = 'none';
		},
		/**
		 * 渐显元素
		 * @param {Element} target 目标元素
		**/
		fadeIn: function(target) {
			var value = 0;
			target.style.opacity = value / 100;
			target.style.filter = 'alpha(opacity=' + value + ')';
			target.style.display = 'block';
			setInterval(function() {
				if (value < 100) {
					value = value + 10;
					target.style.opacity = value / 100;
					target.style.filter = 'alpha(opacity=' + value + ')';
				} else {
					return
				}
			}, 80);
		},
		/**
		 * 渐隐元素
		 * @param {Element} target 目标元素
		**/
		fadeOut: function(target) {
			var value = 100;
			target.style.opacity = value / 100;
			target.style.filter = 'alpha(opacity=' + value + ')';
			target.style.display = 'none';
			setInterval(function() {
				if (value > 0) {
					value = value - 10;
					target.style.opacity = value / 100;
					target.style.filter = 'alpha(opacity=' + value + ')';
				} else {
					return
				}
			}, 80);
		}
	};
	
	/**
	 * 生成并插入 Slide 结构
	**/
	var buildSlide = function() {
		// Slide 结构
		var slideHtml = '<div id="panel">' +
						'	<ul>' +
						'	</ul>' +
						'</div>' +
						'<div id="slide_bg"></div>' +
						'<div id="trigger">' +
						'	<ul>' +
						'	</ul>' +
						'</div>' +
						'<div id="slide_text"></div>',
			panelHtml = '',
			triggerHtml = '';
			
		// 遍历生成图片信息
		for (var i=0; i<config.imgDataLen; i++) {
			panelHtml += '<li>' +
						 '	<a href="' + config.imgData[i].url + '" title="' + config.imgData[i].title + '" class="pic">' +
						 '		<img src="' + config.imgData[i].src + '" alt="' + config.imgData[i].title + '" class="thumb" />' +
						 '	</a>' +
						 '</li>';
			
			triggerHtml += '<li>' + (i+1) + '</li>';
		}
		
		// 注入 Slide 结构
		doc.getElementById(config.imgTargetId).innerHTML = slideHtml;
		doc.getElementById('panel').getElementsByTagName('ul')[0].innerHTML = panelHtml;
		doc.getElementById('trigger').getElementsByTagName('ul')[0].innerHTML = triggerHtml;
		
		// 设置宽高
		setSlideWH(doc.getElementById(config.imgTargetId), config.imgWidth, config.imgHeight);
	};
	
	/**
	 * 图片切换
	 * @param {Number} index 目标图片的索引值
	 * @param {Function} showFn 切换显示过程的方法
	 * @param {Function} hideFn 切换隐藏过程的方法
	**/
	var imgSwitch = function(index, showFn, hideFn) {
		var slideTarget = doc.getElementById(config.imgTargetId),
			panelLis = doc.getElementById('panel').getElementsByTagName('li'),
			triggerLis = doc.getElementById('trigger').getElementsByTagName('li');
		
		// 显示目标图片
		showFn(panelLis[index]);
		
		// 其他兄弟元素的图片
		var otherPanelLis = siblings(panelLis[index]);
		
		// 其他兄弟元素的触发器
		var otherTriggerLis = siblings(triggerLis[index]);
		
		// 当前触发器增加 class
		triggerLis[index].className = 'cur';
		
		// 遍历其他兄弟元素
		for (var i=0; i<config.imgDataLen-1; i++) {
			hideFn(otherPanelLis[i]);				// 隐藏其他兄弟元素的图片
			otherTriggerLis[i].className = '';		// 其他兄弟触发器移除 class
		}
		
		// 显示当前图片的文字和链接
		var slideText = '<a href="' + config.imgData[index].url + '" title="' + config.imgData[index].title + '" class="pic">' + config.imgData[index].title + '</a>';
		doc.getElementById('slide_text').innerHTML = slideText;
		
		// 鼠标移入时停止切换
		slideTarget.onmouseover = function() {
			config.goSwitch = false;
		};
		// 鼠标移出时允许切换
		slideTarget.onmouseout = function() {
			config.goSwitch = true;
		};
	};
	
	/**
	 * 自动切换
	**/
	var autoSwitch = function() {
		var triggerLis = doc.getElementById('trigger').getElementsByTagName('li');
		
		// 遍历触发器
		for (var i=0; i<config.imgDataLen; i++) {
			// 找到当前触发器
			if (triggerLis[i].className == 'cur') {
				// 获得当前触发器的索引
				config.index = getIndex(triggerLis[i], triggerLis);
			}
		}
		setInterval(function() {
			if (config.goSwitch) {
				if (config.index == config.imgDataLen - 1) {
					config.index = -1;
				}
				imgSwitch(config.index + 1, display.fadeIn, display.fadeOut);
				config.index ++;
			}
			
		}, config.imgInterval);
	};
	
	/**
	 * 插入样式
	**/
	var importCss = function() {
		var style = doc.createElement('style');
		var styles = '#' + config.imgTargetId + '{overflow:hidden;position:relative;margin:0 auto;}' +
					 '#' + config.imgTargetId + ' ul{margin:0;padding:0;list-style-type:none;}' +
					 '#panel li{width:100%;height:100%;position:absolute;background:#fff;}' +
					 '#panel .pic{width:100%;height:100%;display:block;}' +
					 '.pic img{width:100%;height:100%;display:block;border:0 none;}' +
					 '#panel .slide_thumb{display:none;}' +
					 '#trigger{position:absolute;bottom:6px;right:14px;}' +
					 '#trigger ul{height:18px;display:inline;}' +
					 '#trigger li{width:18px;height:18px;line-height:18px;text-align:center;float:left;font-family:Georgia;font-style:italic;background:#000;margin:0 6px;display:inline;color:#ccc;cursor:pointer;filter:alpha(opacity=50);-moz-opacity:.5;opacity:.5;-moz-border-radius:10px;-webkit-border-radius:10px;-khtml-border-radius:10px;border-radius:10px;}' +
					 '#trigger .cur{color:#000;background:#ccc;font-weight:700;}' +
					 '#slide_bg{width:100%;height:30px;position:absolute;bottom:0;background:#000;filter:alpha(opacity=30);-moz-opacity:.3;opacity:.3;}' +
					 '#slide_text{line-height:30px;position:absolute;bottom:0;left:20px;}' +
					 '#slide_text a{color:#fff;text-decoration:none;font-family:"Microsoft YaHei";}';
					 
		(doc.getElementsByTagName('head')[0] || doc.body).appendChild(style);
		if (style.styleSheet) {
			style.styleSheet.cssText = styles;
		} else {
			style.appendChild(doc.createTextNode(styles));
		}
	};
	
	return {
		init: function(obj) {
			// 获取配置信息
			config.imgData = obj.data;								// 设置图片信息
			config.imgTargetId = obj.targetId;						// 设置 Slide 目标 ID
			config.imgWidth = obj.width || config.imgWidth;			// 设置图片宽度
			config.imgHeight = obj.height || config.imgHeight;		// 设置图片高度
			config.imgAuto = obj.auto || config.imgAuto;			// 设置自动播放
			config.imgInterval = obj.interval || config.imgInterval;// 设置间隔时间
			config.imgDataLen = config.imgData.length;				// 设置图片数量
			
			// 插入样式
			importCss();
			
			// 生成 Slide 结构
			buildSlide();
			
			// 初使化 Slide
			imgSwitch(0, display.fadeIn, display.fadeOut);
			
			// 点击切换 Slide
			var triggerUl = doc.getElementById('trigger').getElementsByTagName('ul')[0];
			triggerUl.onclick = function(event) {
				var event = event || window.event,
					target = event.target || event.srcElement,
					siblingLi = target.parentNode.getElementsByTagName('li');
				config.index = getIndex(target, siblingLi);
				imgSwitch(config.index, display.fadeIn, display.fadeOut);
			};
			
			// 自动切换
			if (config.imgAuto) {
				autoSwitch();
			}
		}
	}
})();