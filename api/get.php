<?php
header("Access-Control-Allow-Origin: *");
ob_start("ob_gzhandler");
header("Content-Type: text/html;charset=UTF-8");
header("X-XSS-Protection: 1; mode=block");
/*
Start the session
*/
session_start();
session_regenerate_id();
/*
Website ROOT constant
*/
define('ROOT', "/storage/ssd2/567/7135567/public_html/mineapi");
/*
Database connection
*/
$host='';
$db='';
$user='';
$pass='';
$charset='utf8mb4';
$dsn="mysql:host=$host;dbname=$db;charset=$charset";
$options =[
PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
PDO::ATTR_EMULATE_PREPARES=>false,
];
try{
$pdo=new PDO($dsn, $user, $pass, $options);
} catch(\PDOException $e){
header("Location:error/db");
}
/*
Load all classes
*/
foreach(glob(ROOT."/classes/*.php") as $filename){
include $filename;
}
/*
Checks if the given string is between min and max
*/
function iint($str, $min, $max){
if(filter_var($str, FILTER_VALIDATE_INT, array("options" => array("min_range"=>$min, "max_range"=>$max)))==true){
return 1;
} else {
return 0;
}
}
/*
Class instantiation
*/
$db=new db($pdo);
$request=new request();
$page=0;

if($request->get()){

if($request->are_set(array("page"))){
if(iint($_GET["page"], 0, 100000)){
$page=$_GET["page"];
}
}
}

$d=$db->query("SELECT * FROM records");
$array;
while($row=$d->fetch()){
$array[]=$row;
}

echo json_encode($array);
?>
