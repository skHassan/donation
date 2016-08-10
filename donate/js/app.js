/*===========================Library=====================================*/
//@ this IIF will create $ function with some by default functions

(function(global){
	class myCustomFun{
		constructor() {
	        
	    }
	    ajax(param){
	    	let request = new XMLHttpRequest(),
	    		type    = param.type ? param.type : "GET",
	    		async   = param.async === undefined ? true : param.async,
	    		data    = param.data ? param.data : null,
	    		url     = "";
			if(param.url) url     = param.url;
			else throw "url must be defined";

			request.open(type , url , async);

			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					param.success(request.responseText);
				} else {
					param.error(request.responseText);
				}
			};

			request.onerror = function(res) {
				param.error(res);
			};
			request.send(encodeURIComponent(data));
	    }
	    getDom(selector){
	    	return document.getElementById(selector);
	    }
	    renderView(param){
	    	param.container.innerHTML = param.html;
	    }
	    event(param){
	    	param.dom.addEventListener(param.type,param.callback);
	    }
	    createPopup(param){
	    	let self = this
	    	this.event({
	    		type:"click",
	    		dom : param.closeBtn,
	    		callback(){
	    			self.popupClose(param);
	    		}
	    	})
	    	return {
	    		show(message,autoHide){
	    			param.message               = message;
	    			if(autoHide) param.autoHide = autoHide;
	    			else param.autoHide         = false;
	    			self.popupShow(param);
	    		},
	    		hide(){
	    			self.popupClose(param);
	    		},
	    		afterClose(callback){
	    			self.popupAfterCallback = callback;
	    		}
	    	}
	    }
	    popupShow(param){
	    	var className = 'popup_wrapper';
	    	if (param.wrapper.classList)
			  param.wrapper.classList.add(className);
			else
			  param.wrapper.className     += ' ' + className;
			param.mContainer.innerHTML     = param.message;
			param.container.style.display  = "block";
			if(param.autoHide){
				param.closeBtn.style.display = "none";
				setTimeout(()=>{
					this.popupClose(param);
				},param.autoHide);
			}else{
				param.closeBtn.style.display = "block";
			}
			
	    }
	    popupClose(param,callback){
	    	var className = 'popup_wrapper';
	    	if (param.wrapper.classList)
			  param.wrapper.classList.remove(className);
			else
			  param.wrapper.className = param.wrapper.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
			param.container.style.display        = "none";
			param.mContainer.innerHTML  = "";
			this.popupAfterClose();
	    }
	    popupAfterClose(){
	    	if(this.popupAfterCallback)this.popupAfterCallback();
	    	this.popupAfterCallback = null;
	    }
	}

	global.$ = new myCustomFun();
})(window);






(function IIF(global, $) {

	let privatObj = {
		init(){
			

			this.mainContainer = $.getDom("main_container");

			this.updateData( () =>{
				
					$.renderView({
						container : this.mainContainer,
						html      : `<div class="popup_container" id="popup_c">
											<div class="close_popup pointer" id="close_p"></div>
											<div id="popup_m"></div>
									</div>
								<div class="header comm_shadow" >
									$<span id="total_am">1000</span> still need for this projects
								</div>

								<div class="progress_indicator" id="progress_indicator"></div>

								<div class="info_container comm_shadow com_border">
									<div class="progress_container">
										<div class="progress" id="prgress_width"></div>
									</div>
									<div class="info_message  pos_r">
										<p>
											<span class="bold alert_clr">Only <span id="days_left">0</span> days left </span>to fund this project
										</p>
										<p>
											Join the <span class="bold" id="donate_people">0</span> other donors who have already supported this project. Every doller helps.
										</p>
										<div class="row">
											<div class="clm_50">
												<span class="curr_ic">$</span>
												<input type="text" class="comm_shadow big_input" value="50" id="give_am" />
											</div>
											<div class="clm_50">
												<input type="submit" value="Give Now "  class="comm_shadow big_input" id="give_now"/>
											</div>

										</div>
										<p class="info_q pointer" id="info_why">why give $<span id="reason_am">50</span> ?</p>
									</div>
								</div>

								<div class="row footer">
									<div class="clm_50">
										<input type="button" value="Save for later" class="comm_shadow big_input" id="save_later"/>
									</div>
									<div class="clm_50">
										<input type="button" value="Tell your friends"  class="comm_shadow big_input" id="share_to"/>
									</div>

								</div>`,
					});
					this.totalAm        = $.getDom("total_am");
					this.daysLeft       = $.getDom("days_left");
					this.prgressObj     = $.getDom("prgress_width");
					this.progressInd    = $.getDom("progress_indicator");
					this.donatePeople   = $.getDom("donate_people");
					this.giveNow        = $.getDom("give_now");
					this.giveAm         = $.getDom("give_am");
					this.infoWhy        = $.getDom("info_why");
					this.popupContainer = $.getDom("popup_c");
					this.popupMContain  = $.getDom("popup_m");
					this.popupCloseBtn  = $.getDom("close_p");
					this.saveLater      = $.getDom("save_later");
					this.shareTo        = $.getDom("share_to");
					this.reasonAm       = $.getDom("reason_am");

					this.bindEvent();
					this.createPopupFun();
				}
			);
			
		},
		updateData(callback){
			let self = this;
			$.ajax({
				url     : '/json/database.json' ,
				success(datas){
					self.data = JSON.parse(datas);
					if(self.data.no_donation === self.data.p_value){
						let className = "popup_wrapper";
						if (self.mainContainer.classList)
						  self.mainContainer.classList.remove(className);
						else
						  self.mainContainer.className = self.mainContainer.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');

						$.renderView({
							container : self.mainContainer,
							html      : '<div class="no_valid">Sorry! : This page is no more valid</div>'
						})
					}else{
						fb();

						self.percent = ( self.data.no_donation / self.data.p_value) * 100 ;
						self.indPer  = (100 - self.percent) / 2 ;
						
						if(callback) callback();
						self.updateToDom();
					}

					
				}
			});
		},
		updateToDom(){
			this.prgressObj.style.width = this.percent + '%';

			this.progressInd.style.right =  (this.indPer + '%') ;

			this.totalAm.innerHTML      = this.data.p_value - this.data.no_donation;
			this.daysLeft.innerHTML     = this.data.no_duraion_left;
			this.donatePeople.innerHTML = this.data.no_donor;
		},
		bindEvent(){
			let self = this;
			//on click payment
			$.event({
				type : "click",
				dom  : this.giveNow,
				callback(){
					
					if(self.giveAm.value == 0){
						self.popup.show("Please enter value more than $0",1000);
					}else{
						$.ajax({
							url     : '/donate_money?money='+self.giveAm.value,
							success(datas){
								if(datas === "done"){
									self.popup.show("Thank you for your kind help",1500);
									self.updateData();
									self.popup.afterClose(()=>{
										self.popup.show(`<p class="sm_marBtn">Do you want to donate more?</p><div class="row sm_row">
											<div class="clm_50">
												<input type="button" value="Yes" class="comm_shadow small_input" id="donate_more">
											</div>
											<div class="clm_50">
												<input type="button" value="No" class="comm_shadow small_input" id="donate_nomore">
											</div>

										</div>`);
										$.event({
											type : "click",
											dom  : $.getDom("donate_more"),
											callback(){
												self.popup.hide();
											}
										});
										$.event({
											type : "click",
											dom  : $.getDom("donate_nomore"),
											callback(){
												self.popup.hide();
												$.renderView({
													container : self.mainContainer,
													html      : '<div class="no_valid">Thank you For your Help.</div>'
												})
											}
										})
									});
								}else if(datas ==="complete"){
									$.renderView({
										container : self.mainContainer,
										html      : '<div class="no_valid">Thank you! : This page is no more valid</div>'
									})
								}
								else{
									self.popup.show(datas,1500);
								}
								

								
							}
						});
					}
					
				}
			});
			//on click display popup
			$.event({
				type : "click",
				dom  : this.infoWhy,
				callback(){
					self.popup.show("This project is for test. Your "+self.giveAm.value+" will help us to complete. Thank you.")
				}
			});
			//on save this page as bookmark
			$.event({
				type : "click",
				dom  : this.saveLater,
				callback(){
					if (global.sidebar && global.sidebar.addPanel) { // Mozilla Firefox Bookmark
		                global.sidebar.addPanel(document.title,global.location.href,'');
		            } else if(global.external && ('AddFavorite' in global.external)) { // IE Favorite
		                global.external.AddFavorite(location.href,document.title); 
		            } else if(global.opera && global.print) { // Opera Hotlist
		            } else { // webkit - safari/chrome
		                alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
		            }
				}
			});
			//share post in fb in twitter
			//on click display popup
			$.event({
				type : "click",
				dom  : this.shareTo,
				callback(){
					self.popup.show(`<div class="row sm_row">
									<div class="clm_50">
										<input type="button" value="twitter" class="small_input sharebtn" id="share_twit">
									</div>
									<div class="clm_50">
										<input type="button" value="facebook" class="small_input sharebtn" id="share_fb">

									</div>

								</div>`);
					$.event({
						type : "click",
						dom  : $.getDom("share_fb"),
						callback(){
							  FB.ui({
							    method : 'share',
							    display: 'popup',
							    quote  : 'Yes! I donate this project. You can too.',
							    href   : "https://donatemyprojects.herokuapp.com/donate",
							  }, function(response){});
						}
					})
					$.event({
						type : "click",
						dom  : $.getDom("share_twit"),
						callback(){
							 let text = encodeURIComponent('Yes! I donate this project. You can too.'),
							 	 url  = encodeURIComponent("https://donatemyprojects.herokuapp.com/donate");
							  window.open('https://twitter.com/intent/tweet?text='+text+'&url='+url,'twitter','scrollbars=yes,width=650,height=500');
						}
					})
				}
			});
			$.event({
				type : "keyup",
				dom  : this.giveAm,
				callback(evt){
					
					var charCode = (evt.which) ? evt.which : event.keyCode;

				    if (charCode > 31 && (charCode < 48 || charCode > 57)){
				    	self.giveAm.value = self.giveAm.value.substr(0, self.giveAm.value.length - 1);
			       		return false;
				    }else if(parseInt(self.giveAm.value) > 1000){
				    	self.giveAm.value = self.giveAm.value.substr(0, self.giveAm.value.length - 1);
				    	return false;
				    }
					self.reasonAm.innerHTML = self.giveAm.value;
				}
			})
			
		},
		createPopupFun(){
			this.popup = $.createPopup({
				wrapper   : this.mainContainer,
				container : this.popupContainer,
				mContainer: this.popupMContain,
				closeBtn  : this.popupCloseBtn
			});
		}
	};

		
	
	privatObj.init();
    
    
    // updateData();
})(window, window.$);















































function fb(){
	window.fbAsyncInit = function() {
	    FB.init({
	      appId      : '157574757983427',
	      xfbml      : true,
	      version    : 'v2.7'
	    });
	  };
	 

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
}
