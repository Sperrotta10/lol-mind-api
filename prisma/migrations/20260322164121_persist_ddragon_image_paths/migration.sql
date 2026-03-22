-- Champion image fields
ALTER TABLE "Champion"
ADD COLUMN "avatar" TEXT,
ADD COLUMN "loading" TEXT,
ADD COLUMN "splash" TEXT;

UPDATE "Champion"
SET
  "avatar" = "id" || '.png',
  "loading" = "id" || '_0.jpg',
  "splash" = "id" || '_0.jpg';

ALTER TABLE "Champion"
ALTER COLUMN "avatar" SET NOT NULL,
ALTER COLUMN "loading" SET NOT NULL,
ALTER COLUMN "splash" SET NOT NULL;

-- Item image field
ALTER TABLE "Item" ADD COLUMN "image" TEXT;

UPDATE "Item"
SET "image" = "id" || '.png';

ALTER TABLE "Item"
ALTER COLUMN "image" SET NOT NULL;

-- Rune image fields
ALTER TABLE "Rune"
ADD COLUMN "icon" TEXT,
ADD COLUMN "treeIcon" TEXT;

UPDATE "Rune"
SET
  "icon" = 'perk-images/Styles/' || "tree" || '/' || "key" || '/' || "key" || '.png',
  "treeIcon" = CASE lower("tree")
    WHEN 'domination' THEN 'perk-images/Styles/7200_Domination.png'
    WHEN 'precision' THEN 'perk-images/Styles/7201_Precision.png'
    WHEN 'sorcery' THEN 'perk-images/Styles/7202_Sorcery.png'
    WHEN 'inspiration' THEN 'perk-images/Styles/7203_Inspiration.png'
    WHEN 'resolve' THEN 'perk-images/Styles/7204_Resolve.png'
    ELSE 'perk-images/Styles/' || "tree" || '.png'
  END;

ALTER TABLE "Rune"
ALTER COLUMN "icon" SET NOT NULL,
ALTER COLUMN "treeIcon" SET NOT NULL;
