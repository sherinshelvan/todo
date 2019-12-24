(function($){
	$(document).ready(function(){
    	$('.modal').modal();
    	$('textarea').characterCounter();
    	$('.fixed-action-btn').floatingActionButton();
 	});
  	class GridList{
	  	constructor(){
	  		this.undo = [];
	  		this.edit = '';
	  		this.clear_all = false;
	  		this.list_view();
	  		this.listners();
	  	}
	  	get_storage = () => {
	  		var cards = localStorage.getItem("cards");
			if(cards){
				cards = JSON.parse(cards);
			}	
			else{
				cards = []
			}
			return cards;
	  	}
	  	set_storage = (cards) =>{
	  		localStorage.setItem("cards", JSON.stringify(cards));
	  	}
	  	remove_storage = () =>{
	  		localStorage.removeItem("cards");
	  	}
	  	add_new_item = (add_new = '', checked = '') => {
	  		add_new = add_new ? add_new : $("input#add_new").val();
		  	$("input#add_new").val('');
		  	if(add_new){
		  		var check_html = '<p class="item">\
		  				<label><input type="checkbox" '+checked+' name="check_item[]" data-title="'+add_new+'" /><span>'+add_new+'</span></label>\
		  				<span class="close"><i class="material-icons">close</i></span>\
		  			</p>';
		  		$(".check-list .item-list").append(check_html);  			
		  	}
	  	}
	  	list_view = () => {
	  		var cards = this.get_storage();
				$("div.list-wrapper").empty();
				cards.forEach(function(element, index){
					var html_template = "";
					html_template += '<div class="card prj-item '+(element.completed ? "completed" : "")+'">\
					<span class="edit" data-id="'+index+'"><i class="material-icons">edit</i></span>\
					<span class="remove" data-id="'+index+'"><i class="material-icons">close</i></span>';
					html_template += '<h3 class="title">'+element.title+'</h3>';			
					html_template += '<div class="note">'+element.note+'</div><div class="check-items">';
					element.check_item.forEach(function(sub, sub_index){
						var checked = '';
						if(sub.status){
							checked = 'checked';
						}
						html_template += '<p class="check">\
		  				<label><input type="checkbox" '+checked+' name="in_check[]" data-parent="'+index+'" data-id="'+sub_index+'" data-title="'+sub.title+'" /><span>'+sub.title+'</span></label>\
		  			</p>';
					});
					html_template += '</div></div>';
					$("div.list-wrapper").append(html_template);
				});
	  	}
	  	check_click = (el) => {
				var cards = this.get_storage();
				var current_item = cards[el.data('parent')];
		  	cards[el.data('parent')]['check_item'][el.data('id')]['status'] = el.is(":checked");
		  	var inc = 0;
		  	var checked = 0;
		  	if(current_item.check_item && current_item.check_item.length){
					current_item.check_item.forEach(function(element, index){
						if(element.status){
							checked++;
						}
						inc++
					});
				}
				cards[el.data('parent')]['completed'] = false;
				if(checked === inc){
					cards[el.data('parent')]['completed'] = true;
					el.parents(".card.prj-item").addClass('completed');
				}
				else{
					el.parents(".card.prj-item").removeClass('completed');
				}
		  	this.set_storage(cards); 
	  	}
	  	edit_list = (el) => {
	  		var self = this;
	  		self.reset_form();
	  		self.edit = el.data('id');
	  		var cards = this.get_storage();
	  		var data = cards[this.edit];
	  		$("form#edit_form input#title").val(data.title);
		  	$("form#edit_form #note").val(data.note);
		  	$("#editpopup label").addClass("active");
		  	if(data.check_item && data.check_item.length){
		  		data.check_item.forEach(function(element, index){
	  				self.add_new_item(element.title, (element.status ? "checked" : ""));
		  		});
		  	}
		  	$("#editpopup").modal("open");
	  	}
	  	submit_form = () =>{
	  		var form_data = {
		  		'title' : $("form#edit_form input#title").val(),
		  		'note' : $("form#edit_form #note").val(),
		  		'check_item' : [],
		  		'completed' : false
		  	};
				var check_item = [];
				var inc        = 0;
				var checked    = 0;
		  	$('input[name="check_item[]"]').each(function(index, element){
		  		check_item[index] = {
		  			"title" : $(this).data("title"),
		  			"status" : $(this).is(":checked")
		  		};
		  		if($(this).is(":checked")){
		  			checked++;
		  		}
		  		inc++;
				});
				form_data['completed'] = (inc === checked ? true : false);
				form_data['check_item'] = check_item;
				var cards = this.get_storage();
				if(this.edit !== ''){
					cards[this.edit] = form_data;
				}
				else{
					cards.push(form_data);
				}				
				this.set_storage(cards); 
				this.reset_form();
				$("#editpopup").modal();
				this.list_view();
	  	}
	  	reset_form = () => {
	  		$("form#edit_form input#title").val('');
				$("form#edit_form #note").val('');
				$(".item-list").empty('');
	  	}
	  	listners = () => {
	  		var self = this;
	  		$(document).on("click", "#editpopup a.add", function(){
	  			self.add_new_item();
	  		});
	  		$(document).on("click", "a.clear-all", function(){
	  			self.undo = self.get_storage();
	  			self.remove_storage();
	  			self.clear_all = true;
	  			self.list_view();
			  	var toastHTML = '<span>Todo successfully removed. </span><button class="btn-flat undo toast-action">Undo</button>';
	  			M.toast({html: toastHTML});
	  		});
	  		$(document).on("click", "span.close", function(){
			   	$(this).parents(".item").remove();
				});
				$(document).on("click", ".list-wrapper span.remove", function(){
				  	var cards = self.get_storage();
				  	self.undo = cards[$(this).data('id')];
				  	cards.splice( $(this).data('id') ,1 );
				  	self.set_storage(cards);
				  	self.list_view();
				  	var toastHTML = '<span>Todo successfully removed. </span><button class="btn-flat undo toast-action">Undo</button>';
		  			M.toast({html: toastHTML});
				});
				$(document).on("click", ".list-wrapper span.edit", function(){
				  	self.edit_list($(this));
				});
				$(document).on("change", 'input[name="in_check[]"]', function(){
				  	self.check_click($(this));
				});
				$("form#edit_form").submit(function(){
				  	self.submit_form($(this));
				});
				$(document).on("click", "button.undo", function(){
				  	M.Toast.dismissAll();
				  	var cards = self.get_storage();
				  	cards.push(self.undo);
				  	if(self.clear_all){
						var cards      = self.undo;
						self.clear_all = false;
				  	}
				  	self.set_storage(cards);
				  	self.list_view();
				});
				$(document).on('keyup', "input#add_new", function (e) {
				  	if(e.keyCode === 13 && $(this).val() != '' ){
				  		self.add_new_item();
				  	}
				});
				$(document).on("click", "a.add-new", function(){
				  self.edit = '';
				  self.reset_form();
				});
				
	  	}
  	}
  	new GridList();
})(jQuery);