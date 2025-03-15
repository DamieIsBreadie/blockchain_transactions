import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

# Initialize Firebase if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")  # Update with your Firebase key path
    firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

@app.route("/submit", methods=["POST"])
def submit_to_blockchain():
    """
    This API receives AI results and submits them to the blockchain using index.ts.
    """
    try:
        data = request.get_json()
        post_id = data.get("post_id")
        ai_score = data.get("ai_score")
        checked_score = data.get("checked_score")

        if not post_id or ai_score is None or checked_score is None:
            return jsonify({"error": "Missing required fields"}), 400

        # Run index.ts to submit to the blockchain
        result = subprocess.run(
            ["npx", "ts-node", "index.ts", post_id, str(ai_score), str(checked_score)],
            shell=True, capture_output=True, text=True
        )

        if result.returncode != 0:
            return jsonify({"error": "Blockchain submission failed", "details": result.stderr}), 500
        
        # Extract transaction hash from the index.ts output
        try:
            output_json = json.loads(result.stdout.strip().split("\n")[-1])  # Get last JSON output
            transaction_hash = output_json.get("transactionHash", "Unknown")
        except json.JSONDecodeError:
            transaction_hash = "Unknown"

        if transaction_hash == "Unknown":
            return jsonify({"error": "Transaction hash not found"}), 500

        # 🔹 Store Transaction Hash in Firebase 🔹
        post_ref = db.collection("blockchain_transactions").document(post_id)
        post_doc = post_ref.get()

        if post_doc.exists:
            post_data = post_doc.to_dict()
            existing_hashes = post_data.get("transaction_hashes", [])
        else:
            existing_hashes = []

        # Append new hash to array
        existing_hashes.append(transaction_hash)

        # Update Firestore document
        post_ref.set({
            "post_id": post_id,
            "transaction_hashes": existing_hashes,
            "latest_transaction_hash": transaction_hash
        }, merge=True)

        return jsonify({
            "status": "success",
            "transaction_hash": transaction_hash,
            "blockchain_output": result.stdout
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
