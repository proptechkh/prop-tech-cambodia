-- Fix property images to use real Unsplash URLs
UPDATE property_images SET storage_path='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80' WHERE property_id='prop-1';
UPDATE property_images SET storage_path='https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80' WHERE property_id='prop-2';
UPDATE property_images SET storage_path='https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80' WHERE property_id='prop-3';
UPDATE property_images SET storage_path='https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=80' WHERE property_id='prop-4';
UPDATE property_images SET storage_path='https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80' WHERE property_id='prop-5';
