import arcpy
import Tkinter as tk
import tkFileDialog
import os
import shutil
from glob import glob

from datetime import datetime

arcpy.env.overwriteOutput = True

class MainApplication():
    def __init__(self, root):
        self.paddingx = 80
        self.paddingy = 20

        self.gdbToGDB = tk.Button(root, text ="GDB To GDB", command = self.copyGDBToGDB)
        self.emptyGDBBtn = tk.Button(root, text ="Create Empty GDB", command = self.createEmptyGDB)

        self.statusLabel = tk.Label(root, text="")
        
        self.gdbToGDB.grid(row = 0, column = 0, pady = self.paddingy, padx = self.paddingx)
        self.statusLabel.grid(row = 1, column = 0, pady = self.paddingy, padx = self.paddingx)
        self.emptyGDBBtn.grid(row = 2, column = 0, pady = self.paddingy, padx = self.paddingx)

    def copyGDBToGDB(self):
        self.statusLabel['text'] = 'Running...'
        self.targetGDB = tkFileDialog.askdirectory(parent=root, title='Target GDB', initialdir='D:/')

        if self.targetGDB is None or self.targetGDB == "":
            self.statusLabel['text'] = 'Target GDB not Valid...'
            return

        self.sourceGDB = tkFileDialog.askdirectory(parent=root, title='Source GDB', initialdir='D:/')

        if self.sourceGDB is None or self.sourceGDB == "":
            self.statusLabel['text'] = 'Source GDB not Valid...'
            return

        self.startCopying()

    def startCopying(self):
        self.statusLabel['text'] = 'Running...'
        self.copyExposures()
        self.copyFlightLines()
        self.copyShapeFiles()
        self.statusLabel['text'] = 'Done...'

    def copyExposures(self):
        self.targetExposuresFC = os.path.join(self.targetGDB, 'EXPORSURES')
        self.sourceExposuresFC = os.path.join(self.sourceGDB, 'EXPORSURES')

        try:
            cursorTarget = arcpy.da.InsertCursor(self.targetExposuresFC, ['SHAPE@', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON'])

            for feature in arcpy.da.SearchCursor(self.sourceExposuresFC, ['SHAPE@', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON']):
                cursorTarget.insertRow([feature[0], feature[1], feature[2], feature[3]])

            del cursorTarget
        except:
            pass

    def copyFlightLines(self):
        self.targetflightlinesFC = os.path.join(self.targetGDB, 'FLIGHTLINES')
        self.sourceflightlinesFC = os.path.join(self.sourceGDB, 'FLIGHTLINES')
        
        try:
            cursorTarget = arcpy.da.InsertCursor(self.targetflightlinesFC, ['SHAPE@', 'LGD_CODES_IDENTIFIED', 'FLIGHT_ID_IDENTIFIED', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON'])

            for feature in arcpy.da.SearchCursor(self.sourceflightlinesFC, ['SHAPE@', 'LGD_CODES_IDENTIFIED', 'FLIGHT_ID_IDENTIFIED', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON']):
                cursorTarget.insertRow([feature[0], feature[1], feature[2], feature[3], feature[4], feature[5]])

            del cursorTarget
        except:
            pass

    def copyShapeFiles(self):
        self.targetshapefilesFC = os.path.join(self.targetGDB, 'SHAPEFILES')
        self.sourceshapefilesFC = os.path.join(self.sourceGDB, 'SHAPEFILES')

        try:
            cursorTarget = arcpy.da.InsertCursor(self.targetshapefilesFC, ['SHAPE@', 'FLOWN_OR_GEOTAGGED', 'LGD_CODES_IDENTIFIED', 'FLIGHT_ID_IDENTIFIED', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON'])

            for feature in arcpy.da.SearchCursor(self.sourceshapefilesFC, ['SHAPE@', 'FLOWN_OR_GEOTAGGED', 'LGD_CODES_IDENTIFIED', 'FLIGHT_ID_IDENTIFIED', 'FILE_LOCATION', 'SYSTEM_IDENTIFIER', 'ARCHIVED_ON']):
                cursorTarget.insertRow([feature[0], feature[1], feature[2], feature[3], feature[4], feature[5], feature[6]])

            del cursorTarget
        except:
            pass
    
    def createEmptyGDB(self):
        self.statusLabel['text'] = 'Running...'
        self.emptyGDBFolder = tkFileDialog.askdirectory(parent=root, title='Empty GDB Folder', initialdir='D:/')

        if self.emptyGDBFolder is None or self.emptyGDBFolder == "":
            self.statusLabel['text'] = 'Target Folder not Valid...'
            return

        today = datetime.today()
        
        self.gdbName = today.strftime('%Y-%m-%d-%H-%M-%S-DroneFlying.gdb')
        arcpy.CreateFileGDB_management(self.emptyGDBFolder, self.gdbName)

        self.gdbPath = os.path.join(self.emptyGDBFolder, self.gdbName)
        
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

        self.statusLabel['text'] = 'Empty GDB Created...'


if __name__ == "__main__":
    root = tk.Tk()
    root.title("GDB To GDB")
    root.resizable(False, False)

    MainApplication(root)
    root.mainloop()