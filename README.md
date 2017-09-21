# Meglofriend's Dota 2 Counter Pick Front End Website.

### For use, visit: www.meglobot.com/CounterPick

## Overview

The applications enables you to enter a team composition and view which heroes match up the best against the chosen set. With this you are able to see the possible counters to based off Advantage percentage, a statistic developed by Dotabuff and average win rate.

**UPDATE:**
The application has been updated to work with a local nodejs server that covers the server-side socketing to the the java server. The socketing would be redundant if not for the libraries being used by the java server. The goal, if reseach permits, would be to find alternatives for node and use those instead of running another server just for the application.

~~The application uses php for socket connection to the application's server. The application was implemented this way originally just out of an interest in socketing, as well as the the project started as part of a discord bot. In future, if the application is updated, this will most likely be changed to use HTTP requests. There is no need to maintain a connection, and really the php closes the connection after each call. Part of the interest in socketing through php was in consideration of a distributed model where the server and website are not hosted on the same server, again reflected in the origins as a bot system.~~

The application itself is an example of responsive interface design and of a dynamic single page application.

### Check out Meglofriend at www.meglobot.com and www.twitter.com/meglofriend

#### Thanks to Alex Dickson for the excellent plugin

waitForImages jQuery Plugin - v2.2.0 - 2017-02-20
https://github.com/alexanderdickson/waitForImages
Copyright (c) 2017 Alex Dickson; Licensed MIT 