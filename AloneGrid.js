//main object
var AloneGrid = function(setting){
	this.data = setting.data;
	this.header = setting.header;
	this.selectors = setting.selectors;
	this.now_page = 0;
	this.cluster_num = setting.cluster_num;
	this.drawHeader();
	this.setEventHandler();
};

//functions
AloneGrid.prototype.$ = function(query){
	return document.querySelectorAll(query);
};
AloneGrid.prototype.setText = function(dom, text){
	dom.textContent = text;
	dom.innerText = text;
};
AloneGrid.prototype.setEventHandler = function(){
	var search_box = this.$(this.selectors.search_box)[0];
	if(typeof(search_box) != "undefined")search_box.addEventListener("keyup", (function(){
		this.setPage(0);
		this.draw();
	}).bind(this));
	
	var cluster_num_changer = this.$(this.selectors.cluster_num_changer)[0];
	if(typeof(cluster_num_changer) != "undefined")cluster_num_changer.addEventListener("change", (function(){
		var data_cluster_num = this.$(this.selectors.cluster_num_changer)[0].options[this.$(this.selectors.cluster_num_changer)[0].selectedIndex].dataset.clusterNum;
		data_cluster_num = (data_cluster_num == "Infinity") ? Infinity : parseInt(data_cluster_num);
		this.setClusterNum(data_cluster_num);
		this.setPage(0);
		this.draw();
	}).bind(this));
	
	var next_page = this.$(this.selectors.next_page)[0];
	if(typeof(next_page) != "undefined")next_page.addEventListener("click", (function(){
		this.nextPage();
		this.draw();
	}).bind(this));
	
	var prev_page = this.$(this.selectors.prev_page)[0];
	if(typeof(prev_page) != "undefined")prev_page.addEventListener("click", (function(){
		this.prevPage();
		this.draw();
	}).bind(this));
	
	var first_page = this.$(this.selectors.first_page)[0];
	if(typeof(first_page) != "undefined")first_page.addEventListener("click", (function(){
		this.firstPage();
		this.draw();
	}).bind(this));
	
	var last_page = this.$(this.selectors.last_page)[0];
	if(typeof(last_page) != "undefined")last_page.addEventListener("click", (function(){
		this.lastPage();
		this.draw();
	}).bind(this));
	
	var page_buttons = this.$(this.selectors.page_buttons)[0];
	if(typeof(page_buttons) != "undefined")page_buttons.addEventListener("click", (function(e){
		if(typeof(e.target.dataset.page) != "undefined"){
			this.setPage(parseInt(e.target.dataset.page));
			this.draw();
		}
	}).bind(this));
	
	Array.prototype.forEach.call(this.$(this.selectors.main_table + " th"), (function(obj, i){
		if(this.header[i].sortable)obj.addEventListener("click", (function(e){
			if(this.header[i].order == "asc"){
				this.header.forEach(function(obj){
					obj.order = "";
				});
				this.header[i].order = "desc";
				this.sortData(this.header[i].sort_key, "desc");
				this.draw();
			}else{
				this.header.forEach(function(obj){
					obj.order = "";
				});
				this.header[i].order = "asc";
				this.sortData(this.header[i].sort_key, "asc");
				this.draw();
			}
		}).bind(this));
	}).bind(this));
};
AloneGrid.prototype.setPageButtons = function(){
	var page_num = Math.ceil(this.filterData(this.data).length / this.cluster_num);
	var buttons = this.$(this.selectors.page_buttons + " > *");
	
	if(typeof(buttons) != "undefined"){
		//set page buttons
		var page_buttons_num = buttons.length;
		var page_index;
		if(page_num <= page_buttons_num){
			page_index = 0;
		}else{
			var expand_num = parseInt((page_buttons_num - 1) / 2);
			if(this.now_page - expand_num >= 0 && this.now_page + expand_num <= page_num - 1){
				page_index = this.now_page - expand_num;
			}else{
				if(this.now_page - expand_num < 0){
					page_index = 0;
				}else{
					page_index = this.now_page - expand_num - (expand_num - (page_num - 1 - this.now_page));
				}
			}
		}
		
		for(var i = 0; i < buttons.length; i++){
			if(page_index < page_num){
				buttons[i].disabled = false;
				this.setText(buttons[i], page_index + 1);
				buttons[i].dataset.page = page_index;
				buttons[i].classList.remove(this.selectors.disabled_page_button.replace(".", ""));
				if(page_index == this.now_page){
					buttons[i].disabled = true;
					buttons[i].classList.add(this.selectors.now_page_button.replace(".", ""));
				}else{
					buttons[i].classList.remove(this.selectors.now_page_button.replace(".", ""));
				}
				page_index++;
			}else{
				buttons[i].disabled = true;
				this.setText(buttons[i], "");
				buttons[i].dataset.page = -1;
				buttons[i].classList.remove(this.selectors.now_page_button.replace(".", ""));
				buttons[i].classList.add(this.selectors.disabled_page_button.replace(".", ""));
				page_index++;
			}
		}
	}
	
	//set next prev first last buttons
	var next_page = this.$(this.selectors.next_page)[0];
	if(typeof(next_page) != "undefined"){
		if(this.now_page >= Math.ceil(this.filterData(this.data).length / this.cluster_num) - 1){
			next_page.classList.add("alonegrid-disabled-button");
		}else{
			next_page.classList.remove("alonegrid-disabled-button");
		}
	}
	
	var prev_page = this.$(this.selectors.prev_page)[0];
	if(typeof(prev_page) != "undefined"){
		if(this.now_page <= 0){
			prev_page.classList.add("alonegrid-disabled-button");
		}else{
			prev_page.classList.remove("alonegrid-disabled-button");
		}
	}
	
	var first_page = this.$(this.selectors.first_page)[0];
	if(typeof(first_page) != "undefined"){
		if(this.now_page === 0){
			first_page.classList.add("alonegrid-disabled-button");
		}else{
			first_page.classList.remove("alonegrid-disabled-button");
		}
	}
	
	var last_page = this.$(this.selectors.last_page)[0];
	if(typeof(last_page) != "undefined"){
		if(this.now_page == Math.max(0, Math.ceil(this.filterData(this.data).length / this.cluster_num) - 1)){
			last_page.classList.add("alonegrid-disabled-button");
		}else{
			last_page.classList.remove("alonegrid-disabled-button");
		}
	}
};
AloneGrid.prototype.filterData = function(data){
	var search_box = this.$(this.selectors.search_box)[0];
	if(typeof(search_box) == "undefined")return this.data;
	var query = search_box.value;
	if(query === "")return this.data;
	
	var new_data = [];
	data.forEach((function(obj){
		var toString = "";
		Object.keys(obj).forEach(function(key) {
			toString += this[key];
		}, obj);
		if(toString.indexOf(query) != -1)new_data.push(obj);
	}).bind(this));
	
	return new_data;
};
AloneGrid.prototype.drawHeader = function(){
	var main_table = this.$(this.selectors.main_table)[0];
	var thead = document.createElement("thead");
	var tr = document.createElement("tr");
	this.header.forEach((function(obj){
		var th = document.createElement("th");
		if(obj.sortable)th.classList.add(this.selectors.sortable_th.replace(".", ""));
		this.setText(th, obj.name);
		tr.appendChild(th);
	}).bind(this));
	thead.appendChild(tr);
	main_table.appendChild(thead);
};
AloneGrid.prototype.drawHeaderClass = function(){
	Array.prototype.forEach.call(this.$(this.selectors.main_table + " th"), (function(obj, i){
		obj.classList.remove(this.selectors.asc_th.replace(".", ""));
		obj.classList.remove(this.selectors.desc_th.replace(".", ""));
		if(this.header[i].order == "asc")obj.classList.add(this.selectors.asc_th.replace(".", ""));
		if(this.header[i].order == "desc")obj.classList.add(this.selectors.desc_th.replace(".", ""));
	}).bind(this));
};
AloneGrid.prototype.drawData = function(){
	var data = this.filterData(this.data);
	
	var main_table = this.$(this.selectors.main_table)[0];
	var tbody = this.$(this.selectors.main_table + " tbody")[0];
	if(typeof(tbody) != "undefined"){
		tbody.innerHTML = "";
	}else{
		tbody = document.createElement("tbody");
		main_table.appendChild(tbody);
	}
	
	var start_index = this.cluster_num == Infinity ? 0 : this.cluster_num * this.now_page;
	for(var i = 0; i < this.cluster_num && start_index + i < data.length; i++){
		var tr = document.createElement("tr");
		for(var j = 0; j < this.header.length; j++){
			var td = document.createElement("td");
			if(typeof(this.header[j].content) == "function"){
				td.appendChild(this.header[j].content(data[start_index + i]));
			}else{
				this.setText(td, data[start_index + i][this.header[j].content]);
			}
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
};

//api
AloneGrid.prototype.draw = function(header, data){
	this.drawHeaderClass();
	this.drawData();
	this.setPageButtons();
};
AloneGrid.prototype.setPage = function(page_num){
	this.now_page = page_num;
};
AloneGrid.prototype.nextPage = function(){
	if(this.now_page >= Math.ceil(this.filterData(this.data).length / this.cluster_num) - 1)return;
	this.setPage(this.now_page + 1);
};
AloneGrid.prototype.prevPage = function(){
	if(this.now_page <= 0)return;
	this.setPage(this.now_page - 1);
};
AloneGrid.prototype.firstPage = function(){
	this.setPage(0);
};
AloneGrid.prototype.lastPage = function(){
	this.setPage(Math.max(0, Math.ceil(this.filterData(this.data).length / this.cluster_num) - 1));
};
AloneGrid.prototype.setClusterNum = function(cluster_num){
	this.cluster_num = cluster_num;
};
AloneGrid.prototype.sortData = function(property, asc_or_desc){
	if(asc_or_desc == "asc"){
		this.data.sort((function(property){
			return function(a, b){
				if(a[property] > b[property])return 1;
				if(a[property] < b[property])return -1;
				return 0;
			};
		})(property));
	}else{
		this.data.sort((function(property){
			return function(a, b){
				if(a[property] < b[property])return 1;
				if(a[property] > b[property])return -1;
				return 0;
			};
		})(property));
	}
};
