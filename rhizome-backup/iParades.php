<?php
  if (isset($_POST['latitude']) && isset($_POST['longitude'])){
  	$output = array(
			array(
				"name" => "iParade#2",
				"url" => "http://archive.rhizome.org:8080/lovid/iparade/iparade2/",
				"location" => array("latitude" => 40.819931, "longitude" => -73.949188, "accuracy" => 300)
			),
			array(
				"name" => "iParade#3",
				"url" => "http://archive.rhizome.org:8080/lovid/iparade/iparade3/",
				"location" => array("latitude" => 42.727417, "longitude" => -73.680361, "accuracy" => 300)
			)
		);
  }else{
  	$output = "";
  }
  echo json_encode($output);
?>