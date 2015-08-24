library(ggmap)
library(jsonlite)
library(tidyr)

schools <- read.csv("J:/LCGMS_SchoolData.csv")
schools <- schools[,c("ATS.System.Code","Primary.Address","City","State.Code","Zip","Location.Name")]
schools$address <- paste(schools$Primary.Address,schools$City,schools$State.Code,schools$Zip,sep=", ")
geos <- geocode(schools$address)
schools <- cbind(schools,geos)

key <- "&apikey=###"
legs <- data.frame()
schools <- schools[which(schools$Primary.Address!="NOT AVAILABLE"),]
for (i in 1:nrow(schools)){
    templegs <- fromJSON(paste0("http://openstates.org/api/v1/legislators/geo/?lat=",as.character(schools$lat[i]),"&long=",as.character(schools$lon[i]),key))
    templegs <- subset(templegs,select=c("last_name","first_name","district","party","chamber"))
    templegs$dbn <- schools[i,"ATS.System.Code"]
    legs <- rbind(legs,templegs)
}

legs$succinct <- paste(legs$district,"(",legs$first_name,legs$last_name,"-",substr(legs$party,1,1),")",sep=" ")

legs_wide <- legs[,c("dbn","chamber","succinct")]
legs_wide <- spread(legs_wide, "chamber","succinct")    

schools <- merge(schools, legs_wide, by.x="ATS.System.Code",by.y="dbn", all.x=TRUE)
