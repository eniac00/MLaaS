import argparse
import pandas as pd
from pycaret.classification import load_model, predict_model


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument("--headers", nargs='+', help="headers of the csv")
    parser.add_argument("--values", nargs='+', help="values of the csv")

    args = parser.parse_args()

    if not args.headers or not args.values or len(args.headers) != len(args.values):
        print("Error")
        exit(0)
    test_df = pd.DataFrame([args.values], columns=args.headers)
    model = load_model('./model', verbose=False)
    pred = predict_model(model, data=test_df)
    print(pred['prediction_label'][0])



