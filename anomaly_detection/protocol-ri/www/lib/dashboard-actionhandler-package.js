/**
 * @author Be?ta Pletscher
 * @docauthor Be?ta Pletscher
 */

/*
 * This file is the Entry Point for the implementation of this ExtJS package.
 * 
 * NOTE: Please DO NOT edit this file unless you know what you are exactly
 * doing.
 */

// BEGIN: Package definition
(function(){
	{
		var pkg =
		{
		  name : 'dashboard-actionhandler',
		  namespace : 'NV.dashboard.actionhandler',
		  path : 'dashboard-actionhandler',
		  date : new Date('2015','01','06','13','28','50'), // 2015/01/06 13:28:50
		  version : new Ext.Version('1.0.0.16'),
		  description : ''
		};
	
		// Register Package
	
		Ext.namespace( 'NV' );
		var packages = NV.$Packages || (NV.$Packages = {});
		packages[pkg.name] = pkg;
	
		Ext.Loader.setPath( pkg.namespace, 'lib/' + pkg.path );
	}
})();
// END: Package definition
// @tag dashboard-actionhandler
Ext.define('NV.dashboard.actionhandler.ActionHandler',{
	
	config:{
		portletContentObject: {},
		action: {},
		isModel: false,
		context:"",
		scope:{},
		doubleClose:false,
		event: undefined,
		jsClass: undefined,
		parameters: undefined
	},
	
	constructor: function(config){
		this.initConfig(config);
	},
	
	doAction: function(){
		var cond = true;
		if(this.action.condition){
			cond = false;
			cond = this.action.condition;
			if(this.isModel){
				cond = cond.replace(/\${/g, this.context+'("').replace(/}/g,'")'+(this.doubleClose?")":""));
			}else{
				cond = cond.replace(/\${/g, this.context+'["').replace(/}/g,'"]'+(this.doubleClose?"]":""));
			}
			
			cond = eval(cond);
		}
		if(cond){
			if (this.action.command == 'link') {
				var url = this.action.url;
				url = '"' + url + '"';
				if(this.isModel){
					url = url.replace(/\${/g, '"+'+this.context+'("').replace(/}/g, '")'+(this.doubleClose?')+"':'+"'));
				}else{
					url = url.replace(/\${/g, '"+'+this.context+'["').replace(/}/g, '"]'+(this.doubleClose?']+"':'+"'));
				}
				
				url = eval(url);
				if (this.action.target == 'current') {
					window.open(url, '_self');
				} else if(this.action.target == 'blank'){
					window.open(url, '');
				} else if(this.action.target == 'popup'){
					var popup = Ext.create('Ext.window.Window',{
						title:this.action.title,
						width: Ext.getBody().dom.offsetWidth-10,
						height: Ext.getBody().dom.offsetHeight-10,
						left:5,
						top:5,
						bodyBorder:false,
						padding:0,
						margin:0,
						border:false,
						html:"<iframe src='"+url+"' width=100% height=100% style='border:none' />"
					});
					popup.show();
				}else{//default blank
					window.open(url, '');
				}
			} else if (this.action.command == "set") {
				if (this.portletContentObject != undefined) {
					if(this.action.set){	//van set tömb megadva
						if(this.portletContentObject){
							this.portletContentObject.model.beginEdit();
						}
						for(var i=0; i<this.action.set.length; i++){
							var value = this.action.set[i].value;
							if(value=="${this}"){
								value=this.context;
							}
							else if(this.isModel){
								value = value.replace(/\${/g, this.context+'("').replace(/}/g,'")'+(this.doubleClose?")":""));
							}else{
								value = value.replace(/\${/g, this.context+'["').replace(/}/g,'"]'+(this.doubleClose?"]":""));
							}
							value = eval(value);
			
							var output = Ext.clone(this.portletContentObject.model.get("output"));
							output[this.action.set[i].target] = value;
							this.portletContentObject.model.set("output", output);
						}
						if(this.portletContentObject){
							this.portletContentObject.model.endEdit();
						}
					}else{
						if(this.action.value==undefined){
							Ext.Msg.alert("Config error","No action value specified!");
							return;
						}
						if(this.portletContentObject){
							this.portletContentObject.model.beginEdit();
						}
						var value = this.action.value;
						if(value=="${this}"){
							value=this.context;
						}
						else if(this.isModel){
							value = value.replace(/\${/g, this.context+'("').replace(/}/g,'")'+(this.doubleClose?")":""));
						}else{
							value = value.replace(/\${/g, this.context+'["').replace(/}/g,'"]'+(this.doubleClose?"]":""));
						}
						value = eval(value);
		
						var output = Ext.clone(this.portletContentObject.model.get("output"));
						output[this.action.target] = value;
						this.portletContentObject.model.set("output", output);
						if(this.portletContentObject){
							this.portletContentObject.model.endEdit();
						}
					}
				}
			} else if (this.action.command == "newPortlet") {
				if (this.portletContentObject != undefined) {
					var p = this.portletContentObject.portlet.dashboard.createPortlet(this.action);
					this.portletContentObject.portlet.dashboard.insertPortlet(p);
				}
	
			}else if (this.action.command == "showDashboard") {
				if (this.portletContentObject != undefined) {
					//eval the title:
					title = '"' + this.action.title + '"';
					if(this.isModel){
						title = title.replace(/\${/g, '"+'+this.context+'("').replace(/}/g, '")'+(this.doubleClose?')+"':'+"'));
					}else{
						title = title.replace(/\${/g, '"+'+this.context+'["').replace(/}/g, '"]'+(this.doubleClose?']+"':'+"'));
					}
					
					this.action.title = eval(title);
					
					
					//eval the parameters
					for(var i in this.action.parameters){
						var value = this.action.parameters[i];
						if(this.isModel){
							value = value.replace(/\${/g, this.context+'("').replace(/}/g,'")'+(this.doubleClose?")":""));
						}else{
							value = value.replace(/\${/g, this.context+'["').replace(/}/g,'"]'+(this.doubleClose?"]":""));
						}
						
						value = eval(value);
						this.action.parameters[i] = value;
					}
					
					//create dashboard
					var model = Ext.create('NV.dashboard.layout.model.DashboardModel');
					model.beginEdit();
					model.set("dashboardID", NV.dashboard.layout.dashboard.DashboardMain.dashboards.length);
					model.set("urls", NV.dashboard.layout.dashboard.DashboardMain.serverUrls);
					model.set("editable",this.portletContentObject.portlet.dashboard.model.get('editable'));

					model.endEdit();
					Ext.Ajax.request({
						url :this.action.url,
						failure: function(response){
							NV.ext.ux.nv.GlobalErrorHandler.requestFailedErrorHandler(response);
						},
						success : function(response) {
							var config = Ext.decode(response.responseText);
							if(config.error){
								Ext.MessageBox.alert("error", config.error);
								return;
							}
							
							this.model.beginEdit();
							this.model.set("layout", config.layout?config.layout:'dashboard');
							this.model.set("cols", config.cols);
							this.model.set("row", config.row);
							this.model.set("panels", config.panels);
							this.model.set("containers", config.visibilityGroups);
							
							if(this.parameters && config.parameters){
								for(var i in this.parameters){
									for(var j = 0; j < config.parameters.length; j++){
										if(config.parameters[j].name == i){
											config.parameters[j].value = this.parameters[i];
										}
									}
								}
							}
							this.model.set("parameters", config.parameters==undefined?[]:config.parameters);
							this.model.set("panelType","panel");
							if(config.urls){
								model.set("urls", NV.dashboard.layout.dashboard.DashboardMain.serverUrls);
							}
							
							this.model.endEdit();
							var dashboard = Ext.create('NV.dashboard.layout.dashboard.Dashboard', this.model);
							NV.dashboard.layout.dashboard.DashboardMain.dashboards.push(dashboard);
							
							var popup = Ext.create('Ext.window.Window',{
								title:this.title,
								width: Ext.getBody().dom.offsetWidth-10,
								height: Ext.getBody().dom.offsetHeight-10,
								left:5,
								top:5,
								bodyBorder:false,
								padding:0,
								margin:0,
								autoScroll: true,
								overflow:'auto',
								border:false,
								items:[
								       	dashboard.view]
							});
							popup.show();
							
							
						}, 
						scope:{model:model, parameters:this.action.parameters, title:this.action.title}
					});	
				}
	
			} else if (this.action.command == "menu"){
				var items = [];
				for(var i =0; i<this.action.items.length; i++){
					if(this.action.items[i].command == "menu"){
						items.push({
					        text: this.action.items[i].label,
					        menu: this.createRecursiveMenu(this.action.items[i]),
					        scope:{
					        	baseAction: this,
					        	actionItem: this.action.items[i]
					        }
					    });
					}else{
						items.push({
					        text: this.action.items[i].label,
					        handler: function(){
					        	var action = Ext.create('NV.dashboard.actionhandler.ActionHandler',{
									action: this.actionItem,
									context:this.baseAction.context,
									scope: this.baseAction.scope,
									portletContentObject: this.baseAction.portletContentObject,
									isModel:this.baseAction.isModel,
									event:this.baseAction.event,
									doubleClose: this.baseAction.doubleClose
								});
								action.doAction();
					        },
					        scope:{
					        	baseAction: this,
					        	actionItem: this.action.items[i]
					        }
					    });
					}
					
					
				}
				
				var menu = Ext.create('Ext.menu.Menu', {
				   
				    renderTo: Ext.getBody(),  // usually rendered by it's containing component
				    items: items
				});
				if(this.event.browserEvent){this.event = this.event.browserEvent;}
				menu.showAt(this.event.clientX, this.event.clientY);
			
			} else if(this.action.command == "tooltip"){
				
				if(!this.action.html && !this.action.url){
					Ext.Msg.alert("Configuration error","Missing html or url parameter from action!")
				}
				var width = 200;
				if(this.action.width){
					width = this.action.width;
				}
				if(this.action.height){
					height = this.action.height;
				}
				var t;
				if(this.action.html){					
					var text = this.action.html;
					text = '"' + text + '"';
					if(this.isModel){
						text = text.replace(/\${/g, '"+'+this.context+'("').replace(/}/g, '")'+(this.doubleClose?')+"':'+"'));
					}else{
						text = text.replace(/\${/g, '"+'+this.context+'["').replace(/}/g, '"]'+(this.doubleClose?']+"':'+"'));
					}
					
					text = eval(text);
					
		
					t = Ext.create('Ext.tip.ToolTip',{
				//		id: text+"tooltip",
			            html: text,
			            dismissDelay : 0, 
			            showDelay : 0,
			       //     trackMouse: false,
			            autoShow:false,
			            target:this.event?this.event.currentTarget:this.scope.target
			        });
					
				}else{
					
					var url = this.action.url;
					url = '"' + url + '"';
					if(this.isModel){
						url = url.replace(/\${/g, '"+'+this.context+'("').replace(/}/g, '")'+(this.doubleClose?')+"':'+"'));
					}else{
						url = url.replace(/\${/g, '"+'+this.context+'["').replace(/}/g, '"]'+(this.doubleClose?']+"':'+"'));
					}
					
					url = eval(url);

					t = Ext.create('Ext.tip.ToolTip',{
				//		id:url+"tooltip",
						width: width,
				//		height:height,
			            html: "<iframe style='border:none;' src='"+url+"', width='100%' height:'100%'/>",
			            trackMouse:true,
			            dismissDelay: 0,
			            showDelay : 500,
			            autoShow:false,
			            target:this.event?this.event.currentTarget:this.scope.target
			        });					
				}
			}
			//bármilyen műveletet megvalósíthat
			else if(this.action.command == "custom"){
				var resolvedParams = {};
				for(var i in this.action.parameters){
					var p = "";
					if(this.isModel){
						p = this.action.parameters[i].replace(/\${/g, this.context+'("').replace(/}/g,'")'+(this.doubleClose?")":""));
					}else{
						p = this.action.parameters[i].replace(/\${/g, this.context+'["').replace(/}/g,'"]'+(this.doubleClose?"]":""));
					}
					
					p = eval(p);
					resolvedParams[i] = p;
				}
				
				
				Ext.create(this.action.jsClass, {params: resolvedParams, scope:this.scope, context:this.context, portletContent:this.portletContentObject});
			}
			
		}
	},
	createRecursiveMenu: function(action){
		var ret =  {
			    items: []
			};
		for(var i =0; i<action.items.length; i++){
			if(action.items[i].command == 'menu'){
				ret.items.push({
					text:action.items[i].label,
					menu: this.createRecursiveMenu(action.items[i])
				});
			}
			else{
				ret.items.push(
				{
					text: action.items[i].label,
			        handler: function(){
			        	var action = Ext.create('NV.dashboard.actionhandler.ActionHandler',{
							action: this.actionItem,
							context:this.baseAction.context,
							scope: this.baseAction.scope,
							portletContentObject: this.baseAction.portletContentObject,
							isModel:this.baseAction.isModel,
							event:this.baseAction.event,
							doubleClose: this.baseAction.doubleClose
						});
						action.doAction();
			        },
			        scope:{
			        	baseAction: this,
			        	actionItem: action.items[i]
			        }
			    });
			}
		}
		
		return ret;
	}
});

// @tag dashboard-actionhandler
Ext.define('NV.dashboard.actionhandler.DashboardAction',{
	
	config:{
		portletContent:undefined,
		scope:undefined,
		params:undefined
	},
	
	constructor: function(config){
		this.initConfig(config);
		this.createContent();
	},
	
	createContent: function(){
		console.log("Unimplemented method");
	}
});

Ext.ClassManager.addNameAliasMappings({
  "NV.dashboard.actionhandler.ActionHandler": [],
  "NV.dashboard.actionhandler.DashboardAction": []
});
