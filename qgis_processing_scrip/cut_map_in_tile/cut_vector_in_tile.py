##vector_cutter_input=vector
##vector_input=vector
##zoom_input=number 0
##out=folder

from osgeo import ogr
import subprocess
import os
import qgis

driver = ogr.GetDriverByName("ESRI Shapefile")
dataSource = driver.Open(vector_cutter_input, 0)
layer = dataSource.GetLayer()

z= str(zoom_input)

zPath = "%s/%s"%(out,str(z))

if not os.path.exists(zPath):
    os.makedirs(zPath)
        
for feature in layer:
    x = str(feature.GetField("x"))
    xPath = "%s/%s"%(zPath, x)
    yName = str(feature.GetField("y"))
    id = str(feature.GetField("id"))
    
    geom = feature.GetGeometryRef().GetGeometryRef(0)
    
    xA,yA,zA = geom.GetPoint(1)
    xB,yB,zB = geom.GetPoint(3)
        
    if not os.path.exists(xPath):
        os.makedirs(xPath)
    
    fileSHP = "%s/%s.shp"%(xPath,yName)
    fileJSON = "%s/%s.geojson"%(xPath,yName)
    
    #[xmin ymin xmax ymax]
    os.system('ogr2ogr -clipsrc %s -clipsrcwhere id=%s %s %s'%(vector_cutter_input, id, fileSHP, vector_input))
    os.system('ogr2ogr -f "ESRI Shapefile" %s %s -clipsrc %.9f %.9f %.9f %.9f'%( fileSHP, vector_input,xA, yB, xB, yA))

    os.system('ogr2ogr -f GeoJSON %s %s'%(fileJSON,fileSHP))
    driver.DeleteDataSource(fileSHP)

