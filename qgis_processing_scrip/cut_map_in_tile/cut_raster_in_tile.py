##vector_cutter_input=vector
##raster_input=raster
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
lngt = len(layer)
zPath = "%s/%s"%(out,str(z))

if not os.path.exists(zPath):
    os.makedirs(zPath)
    
PNGPath = "%s/PNG"%(out)

if not os.path.exists(PNGPath):
    os.makedirs(PNGPath)
    
zPNGPath = "%s/%s"%(PNGPath,str(z))

if not os.path.exists(zPNGPath):
    os.makedirs(zPNGPath)

i = 0

for feature in layer:
    x = str(feature.GetField("x"))
    xPath = "%s/%s"%(zPath, x)
    yName = str(feature.GetField("y"))
    id = str(feature.GetField("id"))
    
    if not os.path.exists(xPath):
        os.makedirs(xPath)
        
    xPNGPath = "%s/%s"%(zPNGPath, x)
    
    if not os.path.exists(xPNGPath):
        os.makedirs(xPNGPath)
    
    os.system("gdalwarp %s %s/%s.tif -ts 256 256 -cutline %s -cwhere id=%s -crop_to_cutline -r cubicspline"%(raster_input,xPath,yName,vector_cutter_input,id))
    
    os.system('gdal_translate -of PNG %s/%s.tif %s/%s.png'%(xPath,yName,xPNGPath,yName))
    
    i = i+1
    curr = "%s/%s"%(i,lngt)
    print  curr
  
