df <- read.csv("~/Desktop/R/dataSets/ManhattanTree.csv",stringsAsFactors = F)
species <- read.csv("~/Desktop/creative_repo/d3_work/specieslookup.csv",stringsAsFactors = F)
species <- species[,c("species_code","presentation_name")]
trees <- tbl_df(df) %>%
    filter(SPECIES != "" & !is.na(SPECIES) & !is.na(ZIPCODE) & ZIPCODE != "0" & SPECIES != "0" & SPECIES != "NA") %>%
    group_by(ZIPCODE,SPECIES) %>%
    summarize(num = n(), avg_diam = mean(DIAMETER)) %>%
    filter(num >= 10, avg_diam != 0)
trees <- merge(trees, species, by.x= "SPECIES",by.y="Species.Code",all.x=T)
table(trees$presentation_name, useNA="always")

write.csv(trees,"~/Desktop/D3JS/Trees/zipspecies.csv",row.names = F,quote=F)

df2 <- read.csv("~/Desktop/R/dataSets/201509-citibike-tripdata.csv", stringsAsFactors = F)
stations <- unique(df2[,c("start.station.id","start.station.name","start.station.latitude","start.station.longitude")])
names(stations) <- c("id","name","lat","lon")

onedaybike <- df2

starts <- tbl_df(onedaybike) %>%
    group_by(start.station.id) %>%
    summarise(startsHere=n(), startBikes = n_distinct(bikeid))

ends <- tbl_df(onedaybike) %>%
    group_by(end.station.id) %>%
    summarise(endsHere=n(), endBikes = n_distinct(bikeid))

final <- merge(stations,starts,by.x="id",by.y="start.station.id",all.x=T)
final <- merge(final,ends,by.x="id",by.y="end.station.id",all.x=T)
write.csv(final,"~/Desktop/R/dataSets/bike_september.csv",row.names = F,quote=F)
