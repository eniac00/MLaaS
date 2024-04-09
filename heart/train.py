import argparse
from ml import *
import requests

def make_request(dbid, status):
    url = f'http://localhost:3000/signal/{dbid}/{status}'
    response = requests.get(url)

    if response.status_code == 202:
        print("accepted")
    else:
        print("no accepted")



if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument("--dbid", help="id of the container")
    parser.add_argument("--learning",
                        help="select which type of machine learning you would like to perform")
    parser.add_argument("--task",
                        help="select which type of machine learning you would like to perform")
    parser.add_argument("--model",
                        help="select which model you would like to use for this task")
    parser.add_argument("--csv",
                        help="enter the directory of the dataset csv file that you would like to train")
    parser.add_argument("--target",
                        help="select the target column that you would like to predict in the dataset")

    args = parser.parse_args()


    if args.learning == "MachineLearning":
        if args.task == "Classification":
            done = Classification(args.model, args.target, args.csv)
        if args.task == "Regression":
            done = False

    if args.learning == "DeepLearning":
        done = False


    if done:
        make_request(args.dbid, 'true')
    else:
        make_request(args.dbid, 'false')
    
