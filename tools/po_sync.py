import polib
import os
import sys

def sync_po(master_po_path, target_dir):
    if not os.path.exists(master_po_path):
        print(f"Error: Master file {master_po_path} not found.")
        return

    master = polib.pofile(master_po_path)
    master_entries = {entry.msgid: entry for entry in master}
    
    for filename in os.listdir(target_dir):
        if filename.endswith(".po") and filename != os.path.basename(master_po_path):
            file_path = os.path.join(target_dir, filename)
            try:
                target = polib.pofile(file_path)
                target_ids = {entry.msgid for entry in target}
                
                missing_count = 0
                for msgid, entry in master_entries.items():
                    if msgid not in target_ids:
                        new_entry = polib.POEntry(
                            msgid=msgid,
                            msgstr="", 
                            occurrences=entry.occurrences,
                            comment=entry.comment
                        )
                        target.append(new_entry)
                        missing_count += 1
                
                if missing_count > 0:
                    target.save()
                    print(f"Synced {filename}: Added {missing_count} missing entries.")
            except Exception as e:
                print(f"Failed to sync {filename}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 po_sync.py <master_en.po> <locales_dir>")
        sys.exit(1)
    sync_po(sys.argv[1], sys.argv[2])
