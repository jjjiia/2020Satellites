import csv
import json


#oldes and youngest
#highest unemployeement
#highest education and lowest
#densist and least dense
#most dropout

def sortByColumn(inputFileName,column,totalColumn):
    print totalColumn
    csvReader = csv.reader(open(inputFileName, "rb"))
    for row in csvReader:
        keys = row
        columnIndex = row.index(column)
        if totalColumn != "NONE":
            totalColumnIndex = row.index(totalColumn)
        break
        
    columnOnly = []
    maxValue = 0
    
    for row in csvReader:
        gId = row[1]
        gName = row[3]
        value = row[columnIndex]
        if value !="":
            #print row[columnIndex]
            floatValue = float(row[columnIndex])
            if floatValue>0:
                if totalColumn == "NONE":
                    entry = {"value":floatValue, "gId":gId, "gName":gName}
                else:
                    totalValue = float(row[totalColumnIndex])
                    percentValue = floatValue/totalValue*100
                    entry = {"value":percentValue, "gId":gId, "gName":gName}

                columnOnly.append(entry)
            if floatValue >maxValue:
                maxValue = floatValue
    print maxValue
        
    sortedValues = sorted(columnOnly,key=lambda x: x["value"])
    top = sortedValues[0:10]
    bottom = sortedValues[len(sortedValues)-10:len(sortedValues)]
    topWriter = csv.writer(open(column+"_top.csv","w"))
    for t in top:
        topWriter.writerow([t["gId"],t["gName"],t["value"]])

    bottomWriter = csv.writer(open(column+"_bottom.csv","w"))
    for b in bottom:
        bottomWriter.writerow([b["gId"],b["gName"],b["value"]])
    
    print top
    print bottom


 
column = "SE_A17005_003"
totalColumn = "SE_A17005_001"
sortByColumn("R12482075_SL140.csv", column, totalColumn)



#print sortedValues