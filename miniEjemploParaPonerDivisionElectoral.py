import pandas as pd
divElectoral=pd.read_csv('salidas/division_electoral.csv')
convencionales=pd.read_csv('salidas/convencionales_por_mesa.csv')
conInfoElectoral=convencionales.merge(divElectoral,how="left",on='COMUNA')
for d in conInfoElectoral['DISTRITO'].unique():
    conInfoElectoral[conInfoElectoral['DISTRITO']==d].to_csv(d+".csv", index=False)

