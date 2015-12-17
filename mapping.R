A <-"170 Claremont Avenue, New York NY"
B <-"320 West 13th Street, New York, NY"

trip <- route(A,B,mode="transit")
turns <- trip[,c("startLon","startLat")]
#qmplot(startLon, startLat, data=trip)
traveltime <- sum(trip$seconds)
#ggmap(get_googlemap(c(-73.975,40.76), zoom = 13, markers = turns, path = turns))
m1 <- ggmap(get_googlemap(c(-73.975,40.77), zoom=12)) + geom_point(data=trip, aes(x=startLon,y=startLat), color = "red", size=2) + geom_line(data=trip, aes(x=startLon,y=startLat), color="black")

m2 <- ggmap(get_stamenmap(bbox= c(left = -74.02,bottom=40.73,right=-73.9,top=40.825), zoom=13, maptype="watercolor")) + geom_point(data=trip, aes(x=startLon,y=startLat), color = "red", size=2) + geom_line(data=trip, aes(x=startLon,y=startLat), color="black")
