import pickle
import os

BASE_DIR = 'ml'
df = pickle.load(open(os.path.join(BASE_DIR, 'model_new.pkl'), 'rb'))
print('Total rows:', len(df))
print('Columns:', df.columns.tolist())
print('First 3 titles:')
print(df['title'].head(3).tolist())