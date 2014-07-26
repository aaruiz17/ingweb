<?php
include_once 'credentials.php';
$i = json_decode(stripslashes(str_replace('\"', '"', $_REQUEST['i'])));

switch ($i->accion) {

	case 'usuarios':
		$res = $mysqli->query("select * from usuario where usu_nombre = '".$i->name."' and usu_pass = '".$i->pass."'");
		if($obj = $res->fetch_object())
		{
			$o->res = "Si";	
			$o->id = $obj->USU_ID;
		}
		else
			$o->res = "No";	
	break;

	case "categorias":
		$res = $mysqli->query("select * from categorias");
		while($obj = $res->fetch_object())
			{
				$la[] = $obj;
			}
			$o->res = $la;	
	break;

	case "establecimientos":
		$res = $mysqli->query("select * from establecimientos where cat_id=".$i->id." and est_nombre not like '%Los Cebiches de la %'");
		while($obj = $res->fetch_object())
			{
				$la[] = $obj;
			}
			$o->res = $la;	
	break;

	case "menu":
		$res = $mysqli->query("select * from menu where est_id=".$i->id);
		while($obj = $res->fetch_object())
			{
				$la[] = $obj;
			}
			$o->res = $la;	
	break;

	case "user":
		$res = $mysqli->query("select * from usuario u left join persona p on u.USU_ID = p.USU_ID where usu_nombre='".$i->user."'");
		$obj = $res->fetch_object();
			$o->res = $obj;	
	break;

	case 'pedido':
		$res = $mysqli->query('select * from pedido where PERS_ID = '.$i->id.' and ped_estado = 0');
		if($obj = $res->fetch_object())
		{
			$res = $mysqli->query('insert into pedidohasmenu values(default,'.$obj->PED_ID.','.$i->menid.',1,now())');
			$o->res = "insertado";
		}
		else
		{
			$res = $mysqli->query('insert into pedido values(default,'.$i->id.',default)');
			$res = $mysqli->query('select * from pedido where PERS_ID = '.$i->id.' and ped_estado = 0');
			if($obj = $res->fetch_object())
			{
				$res = $mysqli->query('insert into pedidohasmenu values(default,'.$obj->PED_ID.','.$i->menid.',1,getdate())');
			}
		}
	break;

	case 'detalle':
		$res = $mysqli->query('select * from pedido where PERS_ID = '.$i->id.' and ped_estado = 0');
		if($obj = $res->fetch_object())
		{
			$res = $mysqli->query('select * from pedidohasmenu p left join menu m on p.men_id = m.men_id where ped_id = '.$obj->PED_ID);
			while($obj = $res->fetch_object())
				$la[] = $obj;
			$o->res = $la;
		}
		else
			$o->res="No";
	break;

	case 'factura':
		$resultado = $mysqli->query("SELECT fecha, phm_cantidad,men_nombre, men_precio FROM pedidohasmenu ps left join pedido pd on pd.ped_id = ps.ped_id left join menu on ps.men_id = menu.men_id where fecha between '".$i->inicio."' and '".$i->fin."' group by fecha,men_nombre");
		
			while($obj = $resultado->fetch_object())
			{
				$la[] = $obj;
			}
			$o->res = $la;	
			//$o->res ="ashkdha";
			//$o->sa = $datos;
		
		//$o->res = $datos;
		//$o->ds = "dsahjdas";
	break;

	case 'mail':
	$resultado = $mysqli->query("SELECT * FROM t_usuario ORDER BY us_ID DESC LIMIT 1");
	if($obj = $resultado->fetch_object()){
		$asunto="CODE";
		$mail = "peliculas@admin.com";
		$headers = "From: peliculas<".$mail.">\r\n";
		$headers.= "MIME-Version: 1.0\r\n";
		$headers.="Content-type: text/html; charset=UTF-8\r\n";
		$mensaje = "<html><head></head><body>";
		$mensaje.="<p>Su codigo es: ".$obj->password."</p></body></html>";
		
		mail($i->mail, $asunto, $mensaje, $headers);

	}
	break;

	default:
		$resultado = $mysqli->query("SELECT * FROM categorias");
		while($datos = $resultado->fetch_object())
			$dats[] = $datos;
		$o->res = $datos;
		break;
}

    header('Content-type: application/json');
    echo json_encode($o);
?>