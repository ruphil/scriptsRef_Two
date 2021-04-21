import arcpy
import os
import shutil
import tkFileDialog

from glob import glob
from zipfile import ZipFile
from datetime import datetime

import Tkinter as tk

arcpy.env.overwriteOutput = True

class MainApplication():
    def __init__(self):
        print('Running...')
        self.parent_directory = tkFileDialog.askdirectory(title='Parent Folder Path', initialdir='D:/')

        if self.parent_directory is None or self.parent_directory == "":
            return

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
            'FLIGHTLINES', 'POLYLINE', None, "DISABLED", "DISABLED", arcpy.SpatialReference(32643))

        self.flightlinesFC = os.path.join(self.gdbPath, 'FLIGHTLINES')
        arcpy.AddField_management(self.flightlinesFC, 'FLIGHT_ID_FOLDER_NAME', "TEXT")

        arcpy.CreateFeatureclass_management(
            self.gdbPath,
            'SHAPEFILES', 'POLYGON', None, "DISABLED", "DISABLED", arcpy.SpatialReference(32643))

        self.shapefilesFC = os.path.join(self.gdbPath, 'SHAPEFILES')
        arcpy.AddField_management(self.shapefilesFC, 'FLIGHT_ID_FOLDER_NAME', "TEXT")

    def extractZipsAndAttachToGDB(self):
        glob_searchZip = os.path.join(self.parent_directory, "**.zip")
        
        for zipfile in glob(glob_searchZip):
            currentzip = os.path.basename(zipfile)
            temp_dir_each = os.path.join(self.temp_dir, currentzip)

            txtFileName = currentzip + '.txt'
            textFilePath = os.path.join(self.parent_directory, txtFileName)

            self.txtfile = open(textFilePath, 'a')

            os.makedirs(temp_dir_each)
            
            os.chdir(temp_dir_each)
            with ZipFile(zipfile, 'r') as zip:
                zip.extractall()

            self.putKMLsNShapefilesIntoGDB(temp_dir_each)
            self.txtfile.close()

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

    def putKMLsNShapefilesIntoGDB(self, currentFolder):
        subdirectories = self.get_immediate_subdirectories(currentFolder)
        # print(subdirectories)
        for subFolder in subdirectories:
            # print(subFolder)
            self.currentSubFolderName = os.path.basename(os.path.dirname(subFolder))
            print('SubFolder Name', self.currentSubFolderName)

            kmls = self.getKMLs(subFolder)
            # print(kmls)

            kmlcount = 0
            for kml in kmls:
                kmlcount += 1
                self.putKMLIntoGDB(kml)

            shapefiles = self.getShapeFiles(subFolder)
            # print(shapefiles)

            shapefilecount = 0
            for shapefile in shapefiles:
                shapefilecount += 1
                self.putShapefileIntoGDB(shapefile)

            txtStr = 'FolderName: ' + str(self.currentSubFolderName) + ', Number of KMLs: ' + str(kmlcount) + ', Number of Shapefiles:' + str(shapefilecount) + '\n'
            self.txtfile.write(txtStr)
    
    def putKMLIntoGDB(self, kml):
        # print(kml)
        kmlFilename = os.path.splitext(os.path.basename(kml))[0]
        print('KML Filename: ', kmlFilename)

        tempgdbPath = os.path.join(self.temp_dir, 'tmpGDB')
        
        arcpy.KMLToLayer_conversion(kml, tempgdbPath)

        fgdb = tempgdbPath + '/' + kmlFilename + '.gdb'

        fcCopy = os.path.join(fgdb, 'Placemarks', 'Polylines')

        try:
            searchCur = arcpy.da.SearchCursor(fcCopy, ['SHAPE@'])
        except:
            return 0

        inCur = arcpy.da.InsertCursor(self.flightlinesFC, ['SHAPE@', 'FLIGHT_ID_FOLDER_NAME'])

        for feat in searchCur:
            try:
                feat_geom = feat[0].projectAs(arcpy.SpatialReference(32643))
                # print(self.currentSubFolderName)
                inCur.insertRow([feat_geom, self.currentSubFolderName])
            except:
                del inCur, searchCur
                return 0

        del inCur, searchCur

    def putShapefileIntoGDB(self, shapefile):
        # print(shapefile)

        shapeFilename = os.path.splitext(os.path.basename(shapefile))[0]
        print('Shape Filename: ', shapeFilename)

        try:
            searchCur = arcpy.da.SearchCursor(shapefile, ['SHAPE@'])
        except:
            return 0

        inCur = arcpy.da.InsertCursor(self.shapefilesFC, ['SHAPE@', 'FLIGHT_ID_FOLDER_NAME'])

        for feat in searchCur:
            try:
                feat_geom = feat[0].projectAs(arcpy.SpatialReference(32643))
                # print(self.currentSubFolderName)
                inCur.insertRow([feat_geom, self.currentSubFolderName])
            except:
                del inCur, searchCur
                return 0

        del inCur, searchCur
            

if __name__ == "__main__":
    root = tk.Tk()
    root.title("Zips To GDB")
    root.resizable(False, False)
    root.withdraw()

    MainApplication()