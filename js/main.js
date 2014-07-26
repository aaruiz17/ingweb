$(document).ready(function() {		
/*Creacion de la funcion para cuando el usuario seleccione el boton compruebe de que el usuario exista en la base de datos
	si el usuario existe cambia de pagina a la de categorias de lo contrario saltara una alerta
*/	
	$('#Enter').on('tap', function() {
		$.getJSON('http://localhost:2321/App/WS.php?i={"accion":"usuarios","name":"'+$('#User').val()+'","pass":"'+$('#Pass').val()+'"}', function(data) {
				if(data.res == "Si") {
					//Grabar las variables Usuario , Password e ID del usuario
					window.localStorage.setItem("log",$('#User').val());
			    	window.localStorage.setItem("psw",$('#Pass').val());
			    	window.localStorage.setItem("id",data.id);
			    	//Cambio de pagina a Categorias
					$.mobile.changePage('#Categorias', {transition: "slide"});
					//Creacion del texto de todos los headers con el nombre de usuario
					$('a[href="#Profile"]').text(window.localStorage.getItem('log'));
				}
				else
					//Mostrar la alerta en caso de que el usuario no exista
			    		$('#pop').popup('open');
			    		$('input').val("");
		});
	});

	//Creacion de la funcion que al hacer click en el boton pedidos saque los pedidos que ha hecho el usuario
	$('#pedidos').on('tap',function() {
		//Vaciar la tabla
		$('#meni').html('');
		//Cambiar de pagina a Pedidos
		$.mobile.changePage('#Pedidos', {transition:"slide"});
		//Sacar la informacion de la base de datos con el id del usuraio
		$.getJSON('http://localhost:2321/App/WS.php?i={"accion":"detalle", "id":"'+window.localStorage.getItem("id")+'"}', function(data) {
			//Bucle para llenar la tabla con toda la informacion
			$.each(data.res, function(i, e) {
				//Agregar la informacion de la tabla
				$('#meni').append('<tr><td>'+e.MEN_NOMBRE+'</td><td>'+e.MEN_DESCRIPCION+'</td><td>$ '+e.MEN_PRECIO+'.00</td><td><img src="./fotos/'+e.MEN_FOTO+'" style="width:110px; height:110px"></td></tr>');		
			});
		});
	});

	//Agregar eventos al momento de que la pagina Categorias se cree
	$(document).on('pagecreate','#Categorias',function() {
		//Sacar la informacion de todas las categorias que existen en la base de datos
		$.getJSON('http://localhost:2321/App/WS.php?i={"accion":"categorias"}', function(data) {
			//Bucle para llenar la pagina de Categorias
			$.each(data.res, function(i, e) {
				$('#cat').append('<li id="'+e.CAT_ID+'"><a href = #><img src="'+e.CAT_FOTO+'"><h2>'+e.CAT_NOMBRE+'</h2><p>'+e.CAT_DESCRIPCION+'</p></a></li>');
			});
			//Rrefrescar la lista para que logre coger los estilos de la jquery mobile
			$('[data-role=listview]').listview().listview('refresh');
			//Asignar funcion de hacer click a todos los elementos de la lista
			$('#cat li').on('tap',function() {
				//Cambiar la pagina a Establecimientos
				$.mobile.changePage('#Establecimientos', {transition: "slide"});
				//Vaciar la pagina
				$('#est').html('');
				//Sacar la infomacion del elemento que se selecciono a traves del id que se pasa 
				$.getJSON('http://localhost:2321/App/WS.php?i={"accion":"establecimientos","id":"'+$(this).attr('id')+'"}', function(data) {	
					//Bucle para llenar la lista
					$.each(data.res, function(i, e) {
						$('#est').append('<li id="'+e.EST_ID+'"><a href = #><img src="./fotos/'+e.EST_FOTO+'"><h1>'+e.EST_NOMBRE+'</h1></a></li>');
					});
					//Rrefrescar la lista para que logre coger los estilos de la jquery mobile
					$('[data-role=listview]').listview().listview('refresh');
					//Codigo explicado anteriormente
					$('#est li').on('tap',function() {
						$.mobile.changePage('#Menu', {transition: "slide"});
						$('#men').html('');
						$.getJSON('http://localhost:2321/App/WS.php?i={"accion":"menu","id":"'+$(this).attr('id')+'"}', function(data) {	
							$.each(data.res, function(i, e) {
								//Llenar la tabla con la informacion de la base de datos
								$('#men').append('<tr id="'+e.MEN_ID+'"><td>'+e.MEN_NOMBRE+'</td><td>'+e.MEN_DESCRIPCION+'</td><td>$ '+e.MEN_PRECIO+'.00</td><td><img src="./fotos/'+e.MEN_FOTO+'" style="width:110px; height:110px"></td></tr>');		
							});
							//Al hacer click en cualquier elemento de la tabla registrarlos en la base de datos para llenar los pedidos
							$('tr').on('tap',function() {
								var datos = new Object();
									datos.accion = 'pedido';
									datos.id = window.localStorage.getItem("id");
									datos.menid = $(this).attr('id');
								$.ajax({
							      	type:'POST',
							      	url: 'http://localhost:2321/App/WS.php?i='+JSON.stringify(datos),
							      	beforeSend: function() {
								    	$.mobile.loading( 'show', {
											text: '',
											textVisible: true,
											theme: 'a',
											html: ""
										});          
								    },
								    complete: function() {
								    	$.mobile.loading('hide');
								    }, 
								    success: function(data) {
							    	},
							    	error: function() {  
								    }
								});
							});
						});
					});
				});
			});
		});
	//Creacion del evento al hacer slide de izquierda a derecha regresar a la pagina anterior
	}).on('pagecreate','#Establecimientos',function() {
		$('#Establecimientos').on('swiperight', function() {
			$.mobile.pageContainer.pagecontainer('change', '#Categorias', {transition:"slide", reverse:"true"});
		});
	}).on('pagecreate','#Menu',function() {
		$('#Menu').on('swiperight', function() {
			$.mobile.pageContainer.pagecontainer('change', '#Establecimientos', {transition:"slide", reverse:"true"});
		});
	}).on('pageshow','#Profile',function() {
		//Al mostrar la pagina Profile se añade el texto respectivo para cada label
		$('#usuario').html('<strong>Usuario: </strong>');
			$('#nombre').html('<strong>Nombre: </strong>');
			$('#apellido').html('<strong>Apellido: </strong>');
			$('#ID').html('<strong>Documento de Identidad: </strong>');
			$('#fecha').html('<strong>Fecha de Nacimiento: </strong>');
			//Llenar la informacion con respecto a la base de datos
		$.getJSON('http://localhost:2321/App/WS.php?i={"accion":"user","user":"'+window.localStorage.getItem('log')+'"}', function(data) {	
			$('#usuario').append(data.res.USU_NOMBRE);
			$('#nombre').append(data.res.PERS_NOMBRES);
			$('#apellido').append(data.res.PERS_APELLIDOS);
			$('#ID').append(data.res.PERS_DOCUMENTO_ID);
			$('#fecha').append(data.res.PERS_FECHA_NAC);	
		});
	}).on('pagecreate','#Pedidos',function() {
		$('#Pedidos').on('swiperight', function() {
			$.mobile.pageContainer.pagecontainer('change', '#Profile', {transition:"slide", reverse:"true"});
		});
	});
});