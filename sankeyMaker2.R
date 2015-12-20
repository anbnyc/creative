library(data.table)
library(tidyr)
library(dplyr)
library(jsonlite)

df <- data.frame(seq(800000000,800000999))
terms <- data.frame(seq(0,8))
df <- merge(df,terms)

dt <- data.table(df)
setnames(dt,c("studentId","term"))
dt$studentId <- as.character(dt$studentId)
dt$status <- 0
dt$term <- paste0("t",dt$term)
dt <- spread(dt,term,status)
dt[, t0 := floor(runif(100,3,7))]
dt$iep <- 0
dt[round(seq.int(1,1000,5.55)),iep := 1]
dt[iep == 0 & t0 == 5, t0 := 6]

wiggle <- .5
for (i in 3:10){
    for (j in 1:1000){
        temp <- rnorm(1)
        ceiling <- round(runif(1,0,max(0,abs(7 - as.numeric(dt[j,i-1,with=F])),na.rm=T)),digits=0)
        floor <- round(runif(1,0,max(0,abs(3 - as.numeric(dt[j,i-1,with=F])),na.rm=T)),digits=0)
        
        if(temp > wiggle){
            dt[j,i := as.numeric(dt[j,i-1,with=F]) + ceiling,with=F]
        } else if (temp < -1*wiggle) {
            dt[j,i := as.numeric(dt[j,i-1,with=F]) - floor,with=F]
        } else {
            dt[j,i := as.numeric(dt[j,i-1,with=F]),with=F]
        }
        
        if(dt[j,"iep",with=F] == 0 & dt[j,i,with=F] == 5) {
            dt[j,i := 6,with=F]
        }
    }
}

dt <- gather(dt,"term","status",2:10)
dt$status <- as.character(dt$status)

dt[status==3, status := "3: Off Track"]
dt[status==4, status := "4: Almost On Track"]
dt[status==5, status := "5: On Track - Local"]
dt[status==6, status := "6: On Track - Regents"]
dt[status==7, status := "7: On Track - Adv Regents"]

dt <- spread(dt,term,status)

for(k in 2:9){
    dt[,paste0("t",k-2,"_to_t",k-1) := paste0("t",k-2,"_",get(paste0("t",k-2)),".","t",k-1,"_",get(paste0("t",k-1))),with=F]
}

dt <- gather(dt[,c(1,12:19),with=F],"link","movement",2:9)

links <- tbl_df(dt) %>%
    group_by(movement) %>%
    summarize(value = n()) %>%
    mutate(count = value, value = as.character(value/100))

nodes <- as.data.frame(unique(unlist(strsplit(links$movement,"\\."))))
names(nodes) <- "name"
nodes <- as.data.frame(nodes[order(substr(nodes$name,4,4)),])
names(nodes) <- "name"

links$source <- substr(links$movement,1,regexpr("\\.",links$movement) - 1)
links$target <- substr(links$movement,regexpr("\\.",links$movement) + 1,nchar(links$movement))
links <- links[, c("source","target","value","count")]
links <- links[order(links$source,links$target),]

links <- toJSON(links)
nodes <- toJSON(nodes)
write(links,"J:/R/links.json")
write(nodes,"J:/R/nodes.json")
