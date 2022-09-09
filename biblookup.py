#!/usr/bin/env python3

import subprocess
import argparse
import sys
import os,codecs
from pyP2Bclass import pyP2B
import re


parser = argparse.ArgumentParser(description='Retrieve missing BibTeX entries.')
parser.add_argument('missingCites',metavar='citation codes',type=str,nargs='+',help='MR or arXiv numbers')
#parser.add_argument('--add', dest='add', action='store_const',
#                   const=True, default=False,
#                   help='add entries directly into database (default: False)')

args = parser.parse_args()

#baseFileName = args.baseFileName[0]
#blgFile = open(baseFileName+".blg")
missingCites = args.missingCites
bibFileName = None
missingBibFileName = None

#for line in blgFile:
#    if "Found BibTeX data source" in line:
#        bibFileName = line.split("'")[1]
#    if "ERROR - Cannot find" in line:
#        missingBibFileName = line.split("'")[1]
#    elif "I didn't find a database entry for" in line:
#        missingCites.append(line.split("'")[2])

if len(missingCites)>0:
	missingCitesStr = "Searching for: "
	for key in missingCites:
		missingCitesStr += key+" "
	print(missingCitesStr+"\n")

else: 
	print("Emtpy input")

retStr = "\n"

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

for code in missingCites:
    if code[:2] == "MR":
        MRnum = code[2:]
        MRstring = subprocess.check_output(['bash','bibget','r={}'.format(MRnum)]).decode('UTF-8')
        retStr += MRstring.replace("\H o","\H{o}")
        retStr += "\n"
    elif code[:1] == "A":
        retStr += "@MISC{{{0},\nAUTHOR={{N. J. A. Sloane}},\nTITLE={{The {{O}}n-{{L}}ine {{E}}ncyclopedia of {{I}}nteger {{S}}equences}},\nHOWPUBLISHED={{\href{{http://oeis.org/{1}}}{{{2}}}}},\nMONTH={{}},\nYEAR={{}}\n}}".format(code,code,code)
    elif len(code)>=9 and is_number(code) and code[4]==".":
        arXivString = subprocess.check_output(['python','arxiv2bib.py','{}'.format(code)]).decode('UTF-8')
        for i in range(1,10):
            arXivString = arXivString.replace("v{}".format(i),"")
        abstract = False
        for line in iter(arXivString.splitlines()):
            if "PrimaryClass" not in line:
                if "Abstract    " in line:
                    abstract = True
                if "Year      " in line:
                    abstract = False
                if "Month     " in line:
                    line=line.replace("Jan","1")
                    line=line.replace("Feb","2")
                    line=line.replace("Mar","3")
                    line=line.replace("Apr","4")
                    line=line.replace("May","5")
                    line=line.replace("Jun","6")
                    line=line.replace("Jul","7")
                    line=line.replace("Aug","8")
                    line=line.replace("Sep","9")
                    line=line.replace("Oct","10")
                    line=line.replace("Nov","11")
                    line=line.replace("Dec","12")
                if not abstract and "Url      " not in line and "DOI      " not in line:
                    retStr+=line
                    retStr+="\n"
            else:
                retStr+="Journal       = {preprint},\n"
        retStr+="\n"
    elif is_number(code):
        myref = pyP2B()
        pmStr = myref.getPubmedReference(code)
        pmStr = re.sub('\{.*,','{'+code+',',pmStr, count =1 )
        retStr += pmStr + '\n'
    else:
        print("I don't know what to do with the cite code {}".format(code))

retStr = retStr.replace("Erdos","Erd\H{o}s")
retStr = retStr.replace('Erd\\"os',"Erd\H{o}s")
retStr = retStr.replace("Erdös","Erd\H{o}s")
retStr = retStr.replace('ä','\\"a')
retStr = retStr.replace('ü','\\"u')
retStr = retStr.replace('ö','\\"o')
retStr = retStr.replace('á',"\\'a")
retStr = retStr.replace("ó","\\'o")
retStr = retStr.replace("é","\\'e")
retStr = retStr.replace("ő",'\H{o}')
retStr = retStr.replace("Dyson","{D}yson")
retStr = retStr.replace("Brownian","{B}rownian")
retStr = retStr.replace("Hermitian","{H}ermitian")
retStr = retStr.replace("Wigner","{W}igner")
retStr = retStr.replace("Laszlo","L\\'aszl\\'o")



print(retStr)
