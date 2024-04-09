from pycaret.classification import *
import pandas as pd
import sys
from utils import *

def Classification(modelName, target, csvFile):
    try:
        data = pd.read_csv(csvFile)

        features = data.columns.tolist()
        if target not in features:
            print("target not in features")
            return False

        setup(data = data, target = target)

        result = pull()
        makeLog(result=result, flag='setup')
        saveLog(content = { 'features': features })

        if modelName == 'SVM':
            model = create_model('svm')
        if modelName == 'KNN':
            model = create_model('knn')
        if modelName == 'LogisticRegression':
            model = create_model('lr')
        if modelName == 'RandomForest':
            model = create_model('rf')
        

        predict_model(model)
        result = pull()
        makeLog(result=result, flag='pred')

        save_model(model, './model')

        return True

    except Exception as e:
        print("An error occurred:", str(e))
        return False
