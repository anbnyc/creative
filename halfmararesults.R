RSelenium::checkForServer()
RSelenium::startServer()
remDr <- remoteDriver()
remDr$open()

records <- 10000
k <- (records/500)-1

##pull up page
url2 <- "http://web2.nyrrc.org/cgi-bin/start.cgi/aes-programs/results/startup.html?result.id=b50516&result.year=2015"
remDr$navigate(url2)
nperpage <- remDr$findElement(using = "xpath", "/html/body/p/table/tbody/tr/td[2]/form/table/tbody/tr[7]/td[3]/input[2]")
nperpage$clickElement()
Sys.sleep(1)
search <- remDr$findElement(using = "xpath", "/html/body/p/table/tbody/tr/td[2]/form/table/tbody/tr[8]/td[3]/input")
search$clickElement()

##first table
savetable <- remDr$findElement(using = "xpath", "/html/body/p[1]/table/tbody/tr/td[1]/table[2]/tbody")
savetablehtml <- savetable$getElementAttribute("innerHTML")
table <- htmlParse(savetablehtml[[1]])
list <- xpathSApply(table,"//tr/td",xmlValue,trim=TRUE)
saveframe <- data.frame(matrix(list[22:length(list)],ncol=21,byrow=TRUE))
names(saveframe) <- list[1:21]
nextFirst <- remDr$findElement(using = "xpath", "/html/body/p[1]/table/tbody/tr/td[1]/table[1]/tbody/tr/td[2]/p[3]/a[1]")
nextFirst$clickElement()

##subsequent tables
for (i in 1:k){
    currtable <- remDr$findElement(using = "xpath", "/html/body/p[1]/table/tbody/tr/td[1]/table[2]/tbody")
    currtablehtml <- currtable$getElementAttribute("innerHTML")
    table <- htmlParse(currtablehtml[[1]])
    list <- xpathSApply(table,"//tr/td",xmlValue,trim=TRUE)
    frame <- data.frame(matrix(list[22:length(list)],ncol=21,byrow=TRUE))
    saveframe <- rbind(saveframe,frame)
    nextAll <- remDr$findElement(using = "xpath", "/html/body/p[1]/table/tbody/tr/td[1]/table[1]/tbody/tr/td[2]/p[3]/a[2]")
    nextAll$clickElement()
}