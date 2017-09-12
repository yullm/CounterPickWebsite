Meglofriend's Dota 2 Counter Pick Front End Website.

For use, visit: Meglobot.com/CounterPick

The applications enables you to enter a team composition and view which heroes match up the best against the chosen set. With this you are able to see the possible counters to based off Advantage percentage, a statistic developed by Dotabuff and average win rate.

The application uses php for socket connection to the application's server. The application was implemented this way originally just out of an interest in socketing, as well as the the project started as part of a discord bot. In future, if the application is updated, this will most likely be changed to use HTTP requests. There is no need to maintain a connection, and really the php closes the connection after each call. Part of the interest in socketing through php was in consideration of a distributed model where the server and website are not hosted on the same server, again reflected in the origins as a bot system.

The application itself is an example of responsive interface design and of a dynamic single page application.

Check out Meglofriend at www.meglobot.com and www.twitter.com/meglofriend


