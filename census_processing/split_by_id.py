import csv
import json

def splitAndSaveAsJson(inputFileName,key):
    csvReader = csv.reader(open(inputFileName, "rb"))
    for row in csvReader:
        header = row
       # print len(header)
        #print header
        break
    mainKeyIndex = header.index(key)
    
    for row in csvReader:
        outFileName = row[mainKeyIndex]
        geoidDict = {}
        for i in range(0,len(row)):
            
            geoidDict[header[i]]=row[i].decode('latin-1', 'replace')
      
        json.dump(geoidDict,open("counties_new/"+outFileName+".json","w"))

#splitAndSaveAsJson("R12101880_SL050.csv","Geo_GEOID")

#test = "Census Tract 1.02, Do\xf1a Ana County, New Mexico"
#print test.decode('latin-1', 'replace')
#print test.encode("utf-8")
#print u"Census Tract 1.02, Do\xf1a Ana County, New Mexico"


geoIds = ["44007003700","36047023100","36061011300","44007003601","08031004202","36047020100","36047022700","44007003602","44007000800"]

def addGeos(inputFileName,outputFileName,geoIds):
    csvReader = csv.reader(open(inputFileName, "rb"))
    
    outfile = csv.writer(open(outputFileName,"a"))
    for row in csvReader:
        header = row
       # print len(header)
        #print header
        outfile.writerow(header)
        break
    
    for row in csvReader:
        if len(row)>1:
            if row[0] in geoIds:
                print row[0]
                print "yes"
                outfile.writerow(row)

#addGeos("R12102866_SL140.csv","9geoids.csv",geoIds)

def formatForCalculations(inputFileName):
    csvReader = csv.reader(open(inputFileName, "rb"))
    csvCountryReader = csv.reader(open("R12086036_SL040.csv","rb"))
    
    for crow in csvCountryReader:
        cheader = crow
        print cheader
        break
    for crow in csvCountryReader:
        cdata = crow
        break
    
    for row in csvReader:
        header = row
        break
        
    for row in csvReader:
        #print row
        geoFile = csv.writer(open(row[0]+".csv", "w"))
        for h in header:
            if h.split("_")[0]=="ACS17" and h[-1]!="s":
                key = h
                keySD = h+"s"
                value = row[header.index(key)]
                sd = row[header.index(keySD)]
                if key in cheader:
                    cValue = cdata[cheader.index(key)]
                    cSd = cdata[cheader.index(keySD)]
                    if sd!="":
                        #print key,value,keySD,sd
                        geoFile.writerow([row[0]+key,value,sd,cValue,cSd])
        #break
        
        
#formatForCalculations("9geoids.csv")



def addGeos(inputGeos):
    dictionary = {}
    for g in inputGeos:
        #dictionary[g]={}
        csvReader = csv.reader(open(g+".csv","rb"))
        
        for c in csvReader:
            key = c[0].split("_")[2]
            total = float(c[3])
            totalsd = float(c[4])
            value = int(c[1])
            sd = float(c[2])
            if key in dictionary.keys():
                dictionary[key][0]+=value
                dictionary[key][1]+=sd                
            else:
                dictionary[key]=[value,sd,total,totalsd]
    outfile = csv.writer(open("combined.csv","w"))
    for d in dictionary:
        print [d]+ dictionary[d]
        outfile.writerow([d]+ dictionary[d])
        
addGeos(geoIds)