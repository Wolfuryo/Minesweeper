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

if($request->get()){

if($request->are_set(array("name", "rows", "columns", "bombs", "time"))){
$name=$_GET["name"];
$rows=intval($_GET["rows"]);
$cols=intval($_GET["columns"]);
$bombs=intval($_GET["bombs"]);
$time=intval($_GET["time"]);
$max=99999999999;

if(iint($rows, 5, 100) && iint($cols, 5, 100) && iint($bombs, 10, 50000) && iint($time, 1, 99999999999)){

if(strlen($name)<5 || strlen($name)>30){
echo -1;die();
} else {
$name=htmlspecialchars($name);
$db->query("INSERT INTO records (user, rws, columns, bombs, time) VALUES (?, ?, ?, ?, ?)", array($name, $rows, $cols, $bombs, $time));
echo 1;die();
}

} else {
echo -2;die();
}

} else {
echo -3;die();
}

} else {
echo -4;die();
}
?>
