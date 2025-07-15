package utils

import "go.mongodb.org/mongo-driver/bson/primitive"

func ToObjectIDs(ids []string) []primitive.ObjectID {
	var objIDs []primitive.ObjectID
	for _, id := range ids {
		if oid, err := primitive.ObjectIDFromHex(id); err == nil {
			objIDs = append(objIDs, oid)
		}
	}
	return objIDs
}
