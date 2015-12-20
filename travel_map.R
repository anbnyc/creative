library(ggmap)
library(RCurl)
library(googlesheets)
library(jsonlite)
suppressMessages(library(dplyr))

responses <- gs_title("MapInYourLap_Responses")
newdata <- responses %>% gs_read()

cartoapi <- "4feddb054914576135a3d111bb473ce9e2545039"
query <- "select * from mapinyourlap"
currentdata <- fromJSON(paste0("https://anbnyc.cartodb.com/api/v2/sql?q=",query,"&api_key=",cartoapi))


data$Address <- gsub("\n",",",data$Address)
geos <- geocode(data$Address)
data[,c("Lon","Lat")] <- geos

write.csv(data, "/Users/ANB/Desktop/testmap1.csv", row.names=FALSE)
