<?php

if(!($sock = socket_create(AF_INET, SOCK_STREAM, 0)))
{
    $errorcode = socket_last_error();
    $errormsg = socket_strerror($errorcode);
     
    die("Couldn't create socket: [$errorcode] $errormsg \n");
}

if(!socket_connect($sock, 'callback.meglobot.com',1447)){
    $errorcode = socket_last_error();
    $errormsg = socket_strerror($errorcode);
     
    die("Couldn't create connect: [$errorcode] $errormsg \n");
}

$opMessage = filter_input(INPUT_GET,"opMessage")."\r\n";

if( !socket_write ( $sock , $opMessage))
{
    $errorcode = socket_last_error();
    $errormsg = socket_strerror($errorcode);
     
    die("Could not send data: [$errorcode] $errormsg \n");
}

$message = "";
while(($buf = socket_read($sock,1024,PHP_NORMAL_READ)) !== false ){ 
   $message .= $buf;
}

echo $message;

socket_close($sock);