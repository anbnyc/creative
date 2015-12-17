library(pipeR)
library(htmltools)
library(rvest)
library(XML)
library(RSelenium)
library(RCurl)
library(lubridate)
library(data.table)
library(RCurl)

RSelenium::checkForServer()
RSelenium::startServer()
remDr <- remoteDriver()
remDr$open()

times <- format(seq(as.POSIXct("2015-01-01 10:00:00"),as.POSIXct("2015-01-01 13:59:59"),by="mins"),format='%H:%M')
dates <- seq(as.Date("2015-10-13"),as.Date("2015-10-16"),by="days")
dates <- format(dates,"%Y.%m.%d")
exact <- merge(dates,times)
names(exact) <- c("date","time")
#exact <- as.data.table(exact)
#setkey(exact,date)
#sub <- exact[1:20,]

system.time(
#exact[, path := apply()]
path <- apply(exact, 1, function(x) {
    url <- paste0("http://suncalc.net/#/40.7389,-74.004,19/",x["date"],"/",x["time"])
    print(url)
    remDr$navigate(url)
    elem <- remDr$findElements(using = 'css selector', "path")[[8]]
    elem$getElementAttribute("d")[[1]]
})
)

split <- lapply(path, function(x) {
    sub("M","",x)
    strsplit(x,c("L"))
    strsplit(x,",")
})
