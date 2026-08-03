import sys
import json
import traceback

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No GitHub URL provided"}))
        sys.exit(1)
        
    github_link = sys.argv[1]
    
    try:
        from gitingest import ingest
        summary, tree, content = ingest(github_link, max_file_size=50 * 1024 * 1024)
        
        result = {
            "success": True,
            "data": {
                "summary": summary,
                "tree": tree,
                "content": content
            }
        }
        
        # Using print to output to stdout for child_process to read
        print(json.dumps(result))
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
