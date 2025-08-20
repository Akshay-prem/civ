import json, argparse
import pandas as pd
from collections import defaultdict

def exp_weight(year, Y, alpha=0.8):
    return alpha ** (Y - year)

parser = argparse.ArgumentParser()
parser.add_argument('--pyq', required=True)
parser.add_argument('--out', required=True)
args = parser.parse_args()

DF = pd.read_csv(args.pyq)
Y = int(DF['year'].max())
alpha = 0.8

freq = DF.groupby(['topic','year']).size().reset_index(name='count')

scores = defaultdict(float)
for _, row in freq.iterrows():
    scores[row['topic']] += row['count'] * exp_weight(int(row['year']), Y, alpha)

maxv = max(scores.values()) if scores else 1.0
scores = {k: v/maxv for k, v in scores.items()}

with open(f"{args.out}/topic_scores.json", 'w') as f:
    json.dump(scores, f, indent=2)

topic_stats = (
    freq.pivot_table(index='topic', columns='year', values='count', fill_value=0)
         .astype(int)
         .to_dict()
)
with open(f"{args.out}/topic_stats.json", 'w') as f:
    json.dump(topic_stats, f, indent=2)
