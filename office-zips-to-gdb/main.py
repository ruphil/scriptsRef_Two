import arcpy
import os
import shutil
import tkFileDialog

from glob import glob
from zipfile import ZipFile
from datetime import datetime

import Tkinter as tk
import pandas as pd

arcpy.env.overwriteOutput = True

class MainApplication():
    def __init__(self):
        print('Running...')
        self.parent_directory = tkFileDialog.askdirectory(title='Parent Folder Path', initialdir='D:/')

        if self.parent_directory is None or self.parent_directory == "":
            return

        print(self.parent_directory)

        self.temp_dir = os.path.join(self.parent_directory, "tmp")

        self.clearTempDir()
        self.createNewGeoDatabase()
        self.extractZipsAndAttachToGDB()
    
    def clearTempDir(self):
        if os.path.exists(self.temp_dir) and os.path.isdir(self.temp_dir):
            shutil.rmtree(self.temp_dir)

    def createNewGeoDatabase(self):
        today = datetime.today()
        
        self.gdbName = today.strftime('%Y-%m-%d-%H-%M-%S-DroneFlying.gdb')
        arcpy.CreateFileGDB_management(self.parent_directory, self.gdbName)

        self.gdbPath = os.path.join(self.parent_directory, self.gdbName)
        
        arcpy.CreateFeatureclass_management(
            self.gdbPath,
            'EXPORSURES', 'POINT', None, "DISABLED", "DISABLED", arcpy.SpatialReference(32643))

        self.exposuresFC = os.path.join(self.gdbPath, 'EXPORSURES')
        arcpy.AddField_management(self.exposuresFC, 'FILE_LOCATION', "TEXT")
        arcpy.AddField_management(self.exposuresFC, 'SYSTEM_IDENTIFIER', "TEXT")
        arcpy.AddField_management(self.exposuresFC, 'ARCHIVED_ON', "TEXT")
        
        arcpy.CreateFeatureclass_management(
            self.gdbPath,
            'FLIGHTLINES', 'POLYLINE', None, "DISABLED", "DISABLED", arcpy.SpatialReference(32643))

        self.flightlinesFC = os.path.join(self.gdbPath, 'FLIGHTLINES')
        
        arcpy.AddField_management(self.flightlinesFC, 'VILLAGES_COUNT', "TEXT")
        arcpy.AddField_management(self.flightlinesFC, 'HAMLETS_COUNT', "TEXT")
        
        arcpy.AddField_management(self.flightlinesFC, 'LGD_CODES_IDENTIFIED', "TEXT")
        arcpy.AddField_management(self.flightlinesFC, 'FLIGHT_ID_IDENTIFIED', "TEXT")

        arcpy.AddField_management(self.flightlinesFC, 'FILE_LOCATION', "TEXT")
        arcpy.AddField_management(self.flightlinesFC, 'SYSTEM_IDENTIFIER', "TEXT")
        arcpy.AddField_management(self.flightlinesFC, 'ARCHIVED_ON', "TEXT")

        arcpy.CreateFeatureclass_management(
            self.gdbPath,
            'SHAPEFILES', 'POLYGON', None, "DISABLED", "DISABLED", arcpy.SpatialReference(32643))

        self.shapefilesFC = os.path.join(self.gdbPath, 'SHAPEFILES')
        
        arcpy.AddField_management(self.shapefilesFC, 'FLOWN_OR_GEOTAGGED', "TEXT")
        arcpy.AddField_management(self.shapefilesFC, 'LGD_CODES_IDENTIFIED', "TEXT")
        arcpy.AddField_management(self.shapefilesFC, 'FLIGHT_ID_IDENTIFIED', "TEXT")

        arcpy.AddField_management(self.shapefilesFC, 'FILE_LOCATION', "TEXT")
        arcpy.AddField_management(self.shapefilesFC, 'SYSTEM_IDENTIFIER', "TEXT")
        arcpy.AddField_management(self.shapefilesFC, 'ARCHIVED_ON', "TEXT")

    def extractZipsAndAttachToGDB(self):
        glob_searchZip = os.path.join(self.parent_directory, "**.zip")
        
        for zipfile in glob(glob_searchZip):
            currentzip = os.path.basename(zipfile)
            temp_dir_each = os.path.join(self.temp_dir, currentzip)
            # print(temp_dir_each)
            
            os.makedirs(temp_dir_each)
            os.chdir(temp_dir_each)
            with ZipFile(zipfile, 'r') as zip:
                zip.extractall()
            
            self.putKMLsNShapefilesIntoGDB(temp_dir_each, zipfile)

            print('All KMLs and Shapefiles inserted from ' + currentzip)

    def get_immediate_subdirectories(self, a_dir):
            return glob(a_dir + '/*/')

    def getKMLs(self, d):
        pattern = d + '**/**/*.kml'
        # print(pattern)
        return glob(pattern)

    def getShapeFiles(self, d):
        pattern = d + '**/**/*.shp'
        # print(pattern)
        return glob(pattern)

    def putKMLsNShapefilesIntoGDB(self, currentFolder, zipfile):
        zipfilename = os.path.splitext(zipfile)[0]
        csvPath = os.path.join(self.parent_directory, zipfilename) + '.csv'
        # print(csvPath)

        csvDF = pd.read_csv(csvPath, header=None)
        # print(csvDF.head())

        KMLsDir = os.path.join(currentFolder, 'KMLS')
        kmls = self.getKMLs(KMLsDir)
        # print(kmls)

        for kml in kmls:
            kml = kml.replace(os.sep, '/')
            # print(kml)

            file_location = ''
            system_identifier = ''
            date_modified = ''
            for _, row in csvDF.iterrows():
                if row[3] in kml:
                    file_location = row[0]
                    date_modified = row[1]
                    system_identifier = row[2]
            
            self.putKMLIntoGDB(kml, file_location, system_identifier, date_modified)

        ShapefilessDir = os.path.join(currentFolder, 'SHAPEFILES')
        shapefiles = self.getShapeFiles(ShapefilessDir)
        # print(shapefiles)

        for shapefile in shapefiles:
            shapefile = shapefile.replace(os.sep, '/')
            # print(shapefile)

            file_location = ''
            system_identifier = ''
            date_modified = ''
            for _, row in csvDF.iterrows():
                if row[3] in shapefile:
                    file_location = row[0]
                    date_modified = row[1]
                    system_identifier = row[2]

            self.putShapefileIntoGDB(shapefile, file_location, system_identifier, date_modified)
    
    def putKMLIntoGDB(self, kml, file_location, system_identifier, date_modified):
        # print(kml)
        kmlFilename = os.path.splitext(os.path.basename(kml))[0]
        print('KML Filename: ' + str(kmlFilename))

        tempgdbPath = os.path.join(self.temp_dir, 'tmpGDB')
        fgdb = tempgdbPath + '/' + kmlFilename + '.gdb'

        try:
            arcpy.KMLToLayer_conversion(kml, tempgdbPath)
        except:
            pass

        try:
            fcPointsCopy = os.path.join(fgdb, 'Placemarks', 'Points')
            searchCurPoints = arcpy.da.SearchCursor(fcPointsCopy, ['SHAPE@'])
            inCurPoints = arcpy.da.InsertCursor(self.exposuresFC, ['SHAPE@', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON'])
            for featp in searchCurPoints:
                feat_geom = featp[0].projectAs(arcpy.SpatialReference(32643))
                inCurPoints.insertRow([feat_geom, file_location, system_identifier, date_modified])

            del inCurPoints, searchCurPoints
        except:
            pass

        try:
            fcPolylinesCopy = os.path.join(fgdb, 'Placemarks', 'Polylines')
            searchCurPolylines = arcpy.da.SearchCursor(fcPolylinesCopy, ['SHAPE@'])
            inCurPolylines = arcpy.da.InsertCursor(self.flightlinesFC, ['SHAPE@', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON'])
            for featp in searchCurPolylines:
                feat_geom = featp[0].projectAs(arcpy.SpatialReference(32643))
                inCurPolylines.insertRow([feat_geom, file_location, system_identifier, date_modified])

            del inCurPolylines, searchCurPolylines
        except:
            pass

        try:
            fcPolygonsCopy = os.path.join(fgdb, 'Placemarks', 'Polygons')
            searchCurPolygons = arcpy.da.SearchCursor(fcPolygonsCopy, ['SHAPE@'])
            inCurPolygons = arcpy.da.InsertCursor(self.shapefilesFC, ['SHAPE@', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON'])
            for featp in searchCurPolygons:
                feat_geom = featp[0].projectAs(arcpy.SpatialReference(32643))
                inCurPolygons.insertRow([feat_geom, file_location, system_identifier, date_modified])

            del inCurPolygons, searchCurPolygons
        except:
            pass

    def putShapefileIntoGDB(self, shapefile, file_location, system_identifier, date_modified):
        # print(shapefile)
        shapeFilename = os.path.splitext(os.path.basename(shapefile))[0]
        print('Shape Filename: ' + str(shapeFilename))

        try:
            searchCur = arcpy.da.SearchCursor(shapefile, ['SHAPE@'])
            inCur = arcpy.da.InsertCursor(self.shapefilesFC, ['SHAPE@', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON'])
            for feat in searchCur:
                feat_geom = feat[0].projectAs(arcpy.SpatialReference(32643))
                # print(self.currentSubFolderName)
                inCur.insertRow([feat_geom, file_location, system_identifier, date_modified])
            
            del inCur, searchCur
        except:
            pass
            

if __name__ == "__main__":
    root = tk.Tk()
    root.title("Zips To GDB")
    root.resizable(False, False)
    root.withdraw()

    MainApplication()