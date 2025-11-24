#!/bin/bash

echo "🔍 CI/CD Verification Script"
echo "============================"
echo ""

# Check if workflow file exists
if [ -f ".github/workflows/backend-deploy.yml" ]; then
    echo "✅ Workflow file found: .github/workflows/backend-deploy.yml"
else
    echo "❌ Workflow file NOT found!"
    exit 1
fi

# Check if Dockerfile exists
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile found"
else
    echo "❌ Dockerfile NOT found!"
    exit 1
fi

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json NOT found!"
    exit 1
fi

# Check git remote
echo ""
echo "📦 Git Remote:"
git remote -v | head -1

# Check if on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if GitHub Actions is configured
echo ""
echo "🔗 GitHub Actions:"
echo "   Visit: https://github.com/Zriyaz/family-app-backend/actions"
echo "   Check for workflow runs of 'Build and Deploy Backend'"

# Check required secrets (can't verify locally, but remind user)
echo ""
echo "🔐 Required GitHub Secrets:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   Verify at: https://github.com/Zriyaz/family-app-backend/settings/secrets/actions"

# Check AWS resources (if AWS CLI is configured)
if command -v aws &> /dev/null; then
    echo ""
    echo "☁️  AWS Resources Check:"
    
    # Check ECR repository
    if aws ecr describe-repositories --repository-names family-app-backend --region us-east-1 &> /dev/null; then
        echo "   ✅ ECR Repository 'family-app-backend' exists"
        
        # Get latest image
        LATEST_IMAGE=$(aws ecr describe-images \
            --repository-name family-app-backend \
            --region us-east-1 \
            --query 'sort_by(imageDetails,&imagePushedAt)[-1].imageTags[0]' \
            --output text 2>/dev/null)
        
        if [ ! -z "$LATEST_IMAGE" ] && [ "$LATEST_IMAGE" != "None" ]; then
            echo "   📦 Latest image tag: $LATEST_IMAGE"
        fi
    else
        echo "   ⚠️  ECR Repository 'family-app-backend' not found or AWS credentials not configured"
    fi
    
    # Check ECS service
    if aws ecs describe-services \
        --cluster family-app-cluster1 \
        --services backend-service \
        --region us-east-1 &> /dev/null; then
        echo "   ✅ ECS Service 'backend-service' exists in cluster 'family-app-cluster1'"
    else
        echo "   ⚠️  ECS Service not found or AWS credentials not configured"
    fi
else
    echo ""
    echo "⚠️  AWS CLI not installed. Install to verify AWS resources."
fi

echo ""
echo "✅ Local CI/CD configuration check complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Check GitHub Actions tab for workflow runs"
echo "   2. Verify GitHub Secrets are configured"
echo "   3. Test by pushing a commit to main branch"
echo "   4. Monitor deployment in AWS ECS console"

