import os
import cv2
import random

def process_images():
    source_dir = "to_transform"
    output_dir = "processed"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    oliwer_images = []
    damien_images = []
    
    for folder in os.listdir(source_dir):
        folder_path = os.path.join(source_dir, folder)
        if not os.path.isdir(folder_path):
            continue
            
        person = folder.split('_')[0]
        condition = folder.split('_')[1]
        
        for filename in os.listdir(folder_path):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                img_path = os.path.join(folder_path, filename)
                img = cv2.imread(img_path)
                
                if img is not None:
                    img_resized = cv2.resize(img, (128, 128))
                    
                    if person == "oliwer":
                        oliwer_images.append((img_resized, condition, filename))
                    elif person == "damien":
                        damien_images.append((img_resized, condition, filename))
    
    if oliwer_images:
        random.shuffle(oliwer_images)
        
        train_count = int(len(oliwer_images) * 0.8)
        train_images = oliwer_images[:train_count]
        test_images = oliwer_images[train_count:]
        
        train_dir = os.path.join(output_dir, "oliwer", "train")
        test_dir = os.path.join(output_dir, "oliwer", "test")
        
        os.makedirs(train_dir, exist_ok=True)
        os.makedirs(test_dir, exist_ok=True)
        
        for img, condition, filename in train_images:
            output_path = os.path.join(train_dir, f"{condition}_{filename}")
            cv2.imwrite(output_path, img)
        
        for img, condition, filename in test_images:
            output_path = os.path.join(test_dir, f"{condition}_{filename}")
            cv2.imwrite(output_path, img)
        
        print(f"Oliwer: {len(train_images)} train, {len(test_images)} test")
    
    if damien_images:
        random.shuffle(damien_images)
        
        train_count = int(len(damien_images) * 0.8)
        train_images = damien_images[:train_count]
        test_images = damien_images[train_count:]
        
        train_dir = os.path.join(output_dir, "damien", "train")
        test_dir = os.path.join(output_dir, "damien", "test")
        
        os.makedirs(train_dir, exist_ok=True)
        os.makedirs(test_dir, exist_ok=True)
        
        for img, condition, filename in train_images:
            output_path = os.path.join(train_dir, f"{condition}_{filename}")
            cv2.imwrite(output_path, img)
        
        for img, condition, filename in test_images:
            output_path = os.path.join(test_dir, f"{condition}_{filename}")
            cv2.imwrite(output_path, img)
        
        print(f"Damien: {len(train_images)} train, {len(test_images)} test")
    
    print("Processing terminé.")

if __name__ == "__main__":
    process_images()
