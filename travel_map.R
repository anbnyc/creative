library(ggmap)

data <- read.csv("/Users/ANB/Downloads/Travel Recs for E&L - Sheet1.csv")
data$Address <- gsub("\n",",",data$Address)
geos <- geocode(data$Address)
data[,c("Lon","Lat")] <- geos

write.csv(data, "/Users/ANB/Desktop/testmap1.csv", row.names=FALSE)
