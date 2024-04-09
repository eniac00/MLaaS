import json
import os

def saveLog(fileName = 'log.json', content = None):
    if not content:
        print('error')
    else:
        initial_data = []
        try:
            with open(fileName, 'r') as json_file:
                initial_data = json.load(json_file)
            with open(fileName, 'w')as json_file:
                initial_data.append(content)
                json.dump(initial_data, json_file)

        except FileNotFoundError:
            with open(fileName, 'w') as json_file:
                initial_data.append(content)
                json.dump(initial_data, json_file)

        
        


def makeLog(fileName = 'log.json', result=None, flag=None):
    if flag == 'setup':
        if os.path.exists(fileName):
            os.remove(fileName)
        content = {}
        content['Target'] = result.loc[result['Description'] == 'Target', 'Value'].iloc[0]
        content['Target Type'] = result.loc[result['Description'] == 'Target type', 'Value'].iloc[0]
        # content['Target Mapping'] = result.loc[result['Description'] == 'Target mapping', 'Value'].iloc[0]
        content['Numeric features'] = result.loc[result['Description'] == 'Numeric features', 'Value'].iloc[0]
        saveLog(content = content)
    if flag == 'pred':
        content = {}
        content['Model'] = result['Model'][0]
        content['Accuracy'] = result['Accuracy'][0]
        content['Precision'] = result['Prec.'][0]
        content['Recall'] = result['Recall'][0]
        content['F1'] = result['F1'][0]
        saveLog(content = content)
